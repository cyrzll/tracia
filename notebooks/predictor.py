import os
import joblib
import pandas as pd
from schemas import StudentData

# Define base paths and model path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dropout_pipeline.pkl")

# Load model
if not os.path.exists(MODEL_PATH):
    print(f"⚠️ Warning: Model file not found at {MODEL_PATH}. Please run training.py first.")
    model = None
else:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully.")

def get_prediction_internal(data: StudentData):
    """
    Computes dropout risk probability and risk level using the loaded XGBoost model.
    """
    if model is None:
        return None
    
    # Convert input to DataFrame
    input_df = pd.DataFrame([data.model_dump()])

    # Normalize Credit_Accumulation_Velocity (SKS/semester to ratio, standard 18 SKS)
    if 'Credit_Accumulation_Velocity' in input_df.columns:
        if input_df['Credit_Accumulation_Velocity'].iloc[0] > 2.0:
            input_df['Credit_Accumulation_Velocity'] = input_df['Credit_Accumulation_Velocity'] / 18.0

    # Normalize Attendance_Rate (0-100 to 0-1 ratio range)
    if 'Attendance_Rate' in input_df.columns:
        if input_df['Attendance_Rate'].iloc[0] > 1.0:
            input_df['Attendance_Rate'] = input_df['Attendance_Rate'] / 100.0

    # Predict dropout probability
    prob = model.predict_proba(input_df)[0][1]

    # Determine risk level
    if prob > 0.7:
        risk_level = "High"
    elif prob > 0.3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "dropout_risk_probability": round(float(prob), 4),
        "risk_level": risk_level
    }
