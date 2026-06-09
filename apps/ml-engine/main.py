import grpc
import threading
from concurrent import futures
import time
import subprocess
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'proto'))

from proto import ml_engine_pb2, ml_engine_pb2_grpc
from features.matching.engine import engine
from database import supabase

class MLEngineServicer(ml_engine_pb2_grpc.MLEngineServiceServicer):
    def PredictMatch(self, request, context):
        # print(f"[gRPC] Recibida petición de matching para carrera: {request.student.career}")
        result = engine.calculate_match(request.student, request.project)
        return ml_engine_pb2.PredictMatchResponse(
            score=result['score'],
            cluster=result['cluster'],
            skillMatchRatio=result['skill_match_ratio'],
            mandatoryMatch=result['mandatory_match']
        )

    def PredictBatch(self, request, context):
        results = []
        for project in request.projects:
            res = engine.calculate_match(request.student, project)
            results.append(ml_engine_pb2.PredictMatchResponse(
                score=res['score'],
                cluster=res['cluster'],
                skillMatchRatio=res['skill_match_ratio'],
                mandatoryMatch=res['mandatory_match']
            ))
        return ml_engine_pb2.PredictBatchResponse(results=results)

    def TrainModel(self, request, context):
        print(f"[gRPC] Disparando entrenamiento manual. Escenario: {request.scenario or 'default'}")
        
        # Ejecutar el entrenamiento en un proceso separado para no bloquear gRPC
        try:
            # 1. Generar datos (opcional si ya existen, pero bueno para el demo)
            subprocess.Popen([sys.executable, "src/training/data_gen.py", str(request.samples or 5000)])
            
            # 2. Entrenar (esto lo lanzamos después o encadenado)
            # En un entorno real usaríamos una cola de tareas como Celery, 
            # para la tesis, un Popen es suficiente.
            subprocess.Popen([sys.executable, "src/training/trainer.py"])
            
            return ml_engine_pb2.TrainModelResponse(
                success=True,
                versionTag="In Progress",
                message="El proceso de entrenamiento ha comenzado en segundo plano."
            )
        except Exception as e:
            return ml_engine_pb2.TrainModelResponse(
                success=False,
                message=f"Error al iniciar entrenamiento: {str(e)}"
            )

    def GetModelStatus(self, request, context):
        try:
            response = supabase.table("ml_model_versions") \
                .select("*") \
                .eq("active", True) \
                .order("trained_at", desc=True) \
                .limit(1) \
                .execute()
            
            if not response.data:
                return ml_engine_pb2.GetModelStatusResponse(versionTag="none")
            
            v = response.data[0]
            return ml_engine_pb2.GetModelStatusResponse(
                versionTag=v['version_tag'],
                f1Score=v['f1_score'],
                precision=v['precision_val'],
                recall=v['recall_val'],
                scenario=str(v['hyperparameters'].get('scenario', 'unknown')),
                trainedAt=v['trained_at']
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error al consultar Supabase: {str(e)}")
            return ml_engine_pb2.GetModelStatusResponse()

    # ==========================================
    # LÓGICA DE FONDO (THREADS) PARA WEBHOOKS
    # ==========================================
    def _bg_project_embedding(self, project_id):
        try:
            p_resp = supabase.table("projects").select("title, description").eq("id", project_id).execute()
            if not p_resp.data: return
            p = p_resp.data[0]
            
            r_resp = supabase.table("project_required_skills").select("skills(name)").eq("project_id", project_id).execute()
            skills_text = ", ".join([row['skills']['name'] for row in r_resp.data if row.get('skills')])
            
            corpus = f"{p.get('title','')} {p.get('description','')} {skills_text}".strip()
            vector_300 = engine.get_text_embedding(corpus)
            supabase.table("projects").update({"embedding": vector_300}).eq("id", project_id).execute()
            print(f"[THREAD] OK: Proyecto {project_id} re-vectorizado con éxito.")
        except Exception as e:
            print(f"[THREAD] ERROR en proyecto {project_id}: {e}")

    def _bg_student_embedding(self, student_id):
        try:
            s_resp = supabase.table("student_profiles").select("skills").eq("id", student_id).execute()
            if not s_resp.data: return
            
            r_resp = supabase.table("student_skills").select("skills(name)").eq("student_id", student_id).execute()
            nm_skills = [row['skills']['name'] for row in r_resp.data if row.get('skills')]
            legacy_skills = s_resp.data[0].get('skills') or []
            
            final_skills = list(set(nm_skills + legacy_skills))
            corpus = ", ".join(final_skills)
            
            vector_300 = engine.get_text_embedding(corpus)
            supabase.table("student_profiles").update({"embedding": vector_300}).eq("id", student_id).execute()
            print(f"[THREAD] OK: Estudiante {student_id} re-vectorizado con éxito.")
        except Exception as e:
            print(f"[THREAD] ERROR en estudiante {student_id}: {e}")

    def _bg_skill_embedding(self, skill_id):
        try:
            s_resp = supabase.table("skills").select("name, category").eq("id", skill_id).execute()
            if not s_resp.data: return
            s = s_resp.data[0]
            
            corpus = f"{s.get('name','')} {s.get('category','')}".strip()
            vector_300 = engine.get_text_embedding(corpus)
            supabase.table("skills").update({"embedding": vector_300}).eq("id", skill_id).execute()
            print(f"[THREAD] OK: Skill {skill_id} re-vectorizada con éxito.")
        except Exception as e:
            print(f"[THREAD] ERROR en skill {skill_id}: {e}")

    # ==========================================
    # ENDPOINTS gRPC (Retorno Inmediato)
    # ==========================================
    def GenerateProjectEmbedding(self, request, context):
        threading.Thread(target=self._bg_project_embedding, args=(request.project_id,)).start()
        return ml_engine_pb2.EmbeddingResponse(success=True, status="ACCEPTED", message="Processing in background")

    def GenerateStudentEmbedding(self, request, context):
        threading.Thread(target=self._bg_student_embedding, args=(request.student_id,)).start()
        return ml_engine_pb2.EmbeddingResponse(success=True, status="ACCEPTED", message="Processing in background")

    def GenerateSkillEmbedding(self, request, context):
        threading.Thread(target=self._bg_skill_embedding, args=(request.skill_id,)).start()
        return ml_engine_pb2.EmbeddingResponse(success=True, status="ACCEPTED", message="Processing in background")

def serve():
    port = os.environ.get("ML_ENGINE_GRPC_PORT", "50058")
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ml_engine_pb2_grpc.add_MLEngineServiceServicer_to_server(MLEngineServicer(), server)
    
    server.add_insecure_port(f'[::]:{port}')
    print(f"==================================================")
    print(f"🚀 Chambitas ML Engine (gRPC) corriendo en puerto {port}")
    print(f"Modelo Activo: Híbrido RF + KMeans + KNN V11")
    print(f"==================================================")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()