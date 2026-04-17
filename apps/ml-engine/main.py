from fastapi import FastAPI
from pydantic import BaseModel
from database import supabase

app = FastAPI(title="Chambitas ML Engine")

# Modelo de datos simple para probar el matching
class MatchRequest(BaseModel):
    student_skills: list[str]
    job_requirements: list[str]

@app.get("/")
def health_check():
    return {"status": "online", "service": "ML Engine for Chambitas"}

@app.post("/predict")
def predict_match(request: MatchRequest):
    # Por ahora devolvemos un mock de afinidad (OE3 del TI)
    # Aquí es donde entrará tu algoritmo de similitud de cosenos
    return {
        "affinity_score": 0.85,
        "match_found": True,
        "message": "Cálculo de afinidad realizado con éxito"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)