import joblib
import pandas as pd
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1. Define Input Schema (Pydantic)
class StudentData(BaseModel):
    Semester: int
    Current_GPA: float
    GPA_Trend: float
    Attendance_Rate: float
    Credit_Accumulation_Velocity: float
    Failed_Course_Count: int
    Total_Credits_Completed: int
    Payment_Status: str
    Average_Final_Score: float
    Highest_Final_Score: float
    Lowest_Final_Score: float
    Final_Score_Std: float

# 2. Initialize FastAPI
app = FastAPI(title="Student Dropout Prediction API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# ---------------------------

# 3. Load Trained Model Pipeline
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dropout_pipeline.pkl")

if not os.path.exists(MODEL_PATH):
    print(f"⚠️ Warning: Model file not found at {MODEL_PATH}. Please run training.py first.")
    model = None
else:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully.")

@app.get("/")
def home():
    return {"message": "Student Dropout Prediction API is running (CORS Enabled)"}

@app.post("/predict")
def predict(data: StudentData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")
    
    try:
        # Convert input to DataFrame
        input_df = pd.DataFrame([data.model_dump()])

        # Predict dropout probability
        prob = model.predict_proba(input_df)[0][1]

        # Predict label (Yes/No)
        prediction = "Yes" if prob >= 0.5 else "No"

        # Determine risk level
        if prob > 0.7:
            risk_level = "High"
        elif prob > 0.3:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        return {
            "prediction": prediction,
            "dropout_risk_probability": round(float(prob), 4),
            "risk_level": risk_level
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=4322)
