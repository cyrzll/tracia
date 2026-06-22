from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import StudentData, MentorRequest
from predictor import get_prediction_internal
from mentor import generate_mentor_advice
import uvicorn

# Initialize FastAPI
app = FastAPI(title="TRACIA AI Mentor API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)
# ---------------------------

@app.get("/")
def home():
    return {"message": "TRACIA AI Mentor API is running (Ollama Qwen 0.5B integrated)"}

@app.post("/predict")
def predict(data: StudentData):
    result = get_prediction_internal(data)
    if result is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")
    
    return {
        "prediction": "Yes" if result["dropout_risk_probability"] >= 0.5 else "No",
        **result
    }

@app.post("/mentor")
def mentor_advice(request: MentorRequest):
    result = generate_mentor_advice(request)
    if result is None:
        raise HTTPException(status_code=500, detail="Model or advisor service not available.")
    
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=4322)