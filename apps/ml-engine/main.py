import grpc
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
        print(f"[gRPC] Recibida petición de matching para carrera: {request.student.career}")
        
        result = engine.calculate_match(request.student, request.project)
        
        return ml_engine_pb2.PredictMatchResponse(
            score=result['score'],
            cluster=result['cluster'],
            skillMatchRatio=result['skill_match_ratio'],
            mandatoryMatch=result['mandatory_match']
        )

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