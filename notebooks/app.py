import joblib
import pandas as pd
import os
import requests
import json
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

class MentorRequest(BaseModel):
    student_data: StudentData
    student_name: str = "Student"
    nim: str = ""
    major: str = "Informatics Engineering"
    user_message: str = ""
    krs_courses: list[str] = []
    failed_courses: list[str] = []
    unpaid_bill: float = 0.0
    level: int = 1
    xp: int = 0

# 2. Initialize FastAPI
app = FastAPI(title="TRACIA AI Mentor API")

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

def get_prediction_internal(data: StudentData):
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

CORE_ACADEMIC_KEYWORDS = [
    # Academic/Study & Grades
    "gpa", "ipk", "grade", "nilai", "course", "mk", "matakuliah", "mata kuliah", "krs", "sks", "semester", 
    "study", "belajar", "recovery", "roadmap", "progress", "triage", "burnout", "stress", "capek", "lelah", "pusing",
    # Study materials / Topics
    "algorithm", "algoritma", "data structure", "struktur data", "database", "basis data", "web", "programming", 
    "coding", "code", "python", "java", "sql", "design", "ui", "ux", "visual", "marketing", "business", "management",
    # Scholarships & Opportunities
    "scholarship", "beasiswa", "djarum", "yseali", "intern", "magang", "career", "job", "lomba", "kompetisi", 
    "competition", "certification", "sertifikasi", "aws", "gemastik", "opportunity",
    # Financial
    "tuition", "fee", "spp", "bill", "tagihan", "bayar", "financial", "biaya", "uang", "cost",
    # Risk
    "risk", "dropout", "drop out", "danger", "bahaya",
    # Gamification
    "level", "xp", "rank", "game", "quest", "milestone", "leaderboard",
    # People/Help
    "advisor", "dosen", "wali", "pembimbing", "lecturer", "mentor", "advice", "help", "bantu", "tanya", "ask", "question"
]

GREETINGS_AND_FALLBACKS = [
    "hello", "hi", "halo", "hai", "hey", "hei", "pagi", "siang", "sore", "malam", "ok", "okay", "thanks", "thank you", 
    "makasih", "terima kasih", "yes", "no", "ya", "tidak", "good", "morning", "afternoon", "evening", 
    "great", "nice", "cool", "budi", "santoso", "who are you", "who is this", "siapa kamu", "siapa ini"
]

@app.post("/mentor")
def mentor_advice(request: MentorRequest):
    # 1. Get Prediction
    pred = get_prediction_internal(request.student_data)
    if pred is None:
        raise HTTPException(status_code=500, detail="Prediction model not available.")
    
    student = request.student_data
    lower = request.user_message.lower() if request.user_message else ""

    # Context verification pre-check
    if request.user_message:
        is_in_context = False
        # Check core academic keywords
        for word in CORE_ACADEMIC_KEYWORDS:
            if word in lower:
                is_in_context = True
                break
        # If not matched yet, check greetings and polite fallbacks
        if not is_in_context:
            for word in GREETINGS_AND_FALLBACKS:
                if word in lower:
                    is_in_context = True
                    break
        if not is_in_context:
            return {
                "student_name": request.student_name,
                "risk_level": pred['risk_level'],
                "advice": "Sorry, I'm not programmed for this. As your TRACIA AI Mentor, I can only assist you with academic advising, GPA recovery, scholarships, tuition payments, and gamification progress."
            }

    # Deterministic Keyword Matches to prevent Qwen 0.5B numerical comparison hallucinations
    if request.user_message:
        # Check Level/XP
        if any(k in lower for k in ["level", "xp", "rank", "game", "quest"]):
            return {
                "student_name": request.student_name,
                "risk_level": pred['risk_level'],
                "advice": f"Hi {request.student_name}! You are currently **Level {request.level}** with **{request.xp} XP**. Completing your study checklist tasks and daily quests in the **Quests & Gamification** tab is the fastest way to gain XP and rank up on the student leaderboard!"
            }
        
        # Check Career/Job/Intern
        if any(k in lower for k in ["career", "job", "work", "kerja", "intern", "magang", "profesi"]):
            major_name = request.major
            if "Informatics" in major_name or "F11" in request.nim:
                if student.Current_GPA < 3.0:
                    return {
                        "student_name": request.student_name,
                        "risk_level": pred['risk_level'],
                        "advice": f"For an **{major_name}** student with a current GPA of **{student.Current_GPA:.2f}**, I recommend focusing on roles that value practical portfolios over GPA:\n\n"
                                  f"1. **Junior Web Developer**: Build projects using Basis Data and Pemrograman Web (your active courses).\n"
                                  f"2. **AWS Cloud Practitioner**: Complete the **AWS Academy** training in the Opportunity Hub (no GPA req).\n"
                                  f"3. **IT Support / Systems Administrator**: Excellent for entry-level practical skills.\n\n"
                                  f"Leverage portfolio projects and certifications to stand out to employers!"
                    }
                else:
                    return {
                        "student_name": request.student_name,
                        "risk_level": pred['risk_level'],
                        "advice": f"For an **{major_name}** student with a strong GPA of **{student.Current_GPA:.2f}**, you are well-positioned for top-tier careers:\n\n"
                                  f"1. **Software Engineer**: Apply for the **Tokopedia AI Engineer Intern** (Opportunity Hub).\n"
                                  f"2. **Data Scientist**: Apply for the **Shopee Data Scientist Intern** (requires min 3.5 GPA).\n"
                                  f"3. **Cloud Architect**: Build advanced AWS cloud pipelines.\n\n"
                                  f"Prepare coding problems and technical resume drafts to apply!"
                    }
            elif "Information Systems" in major_name or "F12" in request.nim:
                if student.Current_GPA < 3.0:
                    return {
                        "student_name": request.student_name,
                        "risk_level": pred['risk_level'],
                        "advice": f"For an **{major_name}** student with a GPA of **{student.Current_GPA:.2f}**, focus on practical analyst and support roles:\n\n"
                                  f"1. **Junior Business Analyst**: Focus on data organization and database management.\n"
                                  f"2. **IT QA Tester**: Great entry-level position verifying application functionality.\n"
                                  f"3. **Database Administrator assistant**: Build hands-on SQL query experience."
                    }
                else:
                    return {
                        "student_name": request.student_name,
                        "risk_level": pred['risk_level'],
                        "advice": f"For an **{major_name}** student with a strong GPA of **{student.Current_GPA:.2f}**, you can target premium business-IT roles:\n\n"
                                  f"1. **IT Consultant / Systems Analyst**: Design enterprise solutions for clients.\n"
                                  f"2. **Product Manager Intern**: Coordinate business goals with software engineering teams.\n"
                                  f"3. **Data Analyst**: Apply for corporate analytics positions in the Opportunity Hub."
                    }
            elif "Management" in major_name or "F13" in request.nim:
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"For a **{major_name}** student, we suggest targeting the following roles:\n\n"
                              f"1. **Marketing Associate / Digital Marketer**: Leverage analytics tools to drive sales campaigns.\n"
                              f"2. **Operations Administrator**: Focus on workflow efficiency and budgeting.\n"
                              f"3. **Financial Assistant**: Analyze financial accounts and corporate credit sheets."
                }
            elif "Visual Communication Design" in major_name or "F14" in request.nim:
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"For a **{major_name}** student, we suggest building a strong visual portfolio for these career paths:\n\n"
                              f"1. **UI/UX Designer**: Plan user flows and layout interfaces for mobile and web applications.\n"
                              f"2. **Graphic Designer**: Create digital branding, marketing assets, and illustrations.\n"
                              f"3. **Creative Director / Content Creator**: Lead visual storytelling and campaign designs."
                }
            else:
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"Based on your GPA of **{student.Current_GPA:.2f}**, focus on entry-level positions that match your course skills. Check the **Opportunity Hub** for live internships, cloud certifications, and programming competitions to build your portfolio!"
                }

        # Check Scholarship
        if any(k in lower for k in ["scholarship", "beasiswa", "djarum", "yseali"]):
            if student.Current_GPA >= 3.2:
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"Great news! With your GPA of **{student.Current_GPA:.2f}**, you meet the academic criteria for the **Djarum Beasiswa Plus** (requires min 3.20 GPA). I recommend checking the **Opportunity Hub** tab to view complete application requirements and apply!"
                }
            else:
                failed_str = f" (**{', '.join(request.failed_courses)}**)" if request.failed_courses else ""
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"Based on your current GPA of **{student.Current_GPA:.2f}**, you do not meet the minimum GPA requirement of **3.20** for the **Djarum Beasiswa Plus** scholarship. I recommend prioritizing retaking your failed courses{failed_str} to raise your GPA. Meanwhile, you can apply for cloud certifications (**AWS Academy**) and competitions (**Gemastik**) in the Opportunity Hub, which have no GPA requirements!"
                }

        # Check GPA/IPK/Failed courses
        if any(k in lower for k in ["gpa", "ipk", "grade", "failed", "course", "improve", "naik", "nilai"]):
            if student.Current_GPA >= 3.0:
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"Your current Cumulative GPA is **{student.Current_GPA:.2f}**, which is a solid standing! Keep up the great work in your classes to maintain eligibility for top internships and opportunities."
                }
            else:
                failed_str = f" (**{', '.join(request.failed_courses)}**)" if request.failed_courses else ""
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"Your current Cumulative GPA is **{student.Current_GPA:.2f}**. Since this is below 3.0, let's focus on academic recovery. Retaking your failed courses{failed_str} is the fastest way to replace low grades and pull your GPA back above 3.0. Check your study checklist to start!"
                }

        # Check Financial/SPP/Billing
        if any(k in lower for k in ["spp", "bill", "pay", "fee", "financial", "money", "cost", "bayar", "tagihan", "uang", "biaya"]):
            if student.Payment_Status == "Paid":
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"Your tuition billing status is **Paid** (no outstanding balance). You are fully cleared for KRS registration next semester!"
                }
            else:
                return {
                    "student_name": request.student_name,
                    "risk_level": pred['risk_level'],
                    "advice": f"You have an outstanding tuition balance of **Rp {request.unpaid_bill:,.0f}** (Status: **Belum Terbayar**). Dian Nuswantoro University allows students to schedule payment installment plans at the Biro Keuangan office. Settling this will prevent any registration blocks for next semester."
                }

        # Check Risk/Dropout
        if any(k in lower for k in ["risk", "dropout", "drop out", "danger", "bahaya"]):
            bill_msg = f"outstanding tuition fee of **Rp {request.unpaid_bill:,.0f}**" if student.Payment_Status != "Paid" else "no outstanding bills"
            failed_msg = f"**{student.Failed_Course_Count}** failed courses" if student.Failed_Course_Count > 0 else "no failed courses"
            return {
                "student_name": request.student_name,
                "risk_level": pred['risk_level'],
                "advice": f"According to our machine learning model, your Dropout Risk is **{(pred['dropout_risk_probability']*100):.1f}%** (Risk Level: **{pred['risk_level']}**). The primary risk indicators are your GPA of **{student.Current_GPA:.2f}**, {failed_msg}, and {bill_msg}. Addressing these will significantly reduce your risk status."
            }

        # Check Greetings (Fallback for simple pleasantries)
        if any(k in lower for k in ["hello", "hi", "halo", "hai", "hey", "hei", "pagi", "siang", "sore", "malam"]):
            return {
                "student_name": request.student_name,
                "risk_level": pred['risk_level'],
                "advice": f"Hello {request.student_name}! I am your TRACIA AI Mentor. How can I assist you with your academic progress, GPA recovery, or scholarships today?"
            }

    # 2. Construct Prompt for Qwen 0.5B (fallback)
    gpa_standing = "Excellent" if student.Current_GPA >= 3.5 else "Good" if student.Current_GPA >= 3.0 else "Satisfactory" if student.Current_GPA >= 2.0 else "Critical (Below 2.0)"
    scholarship_elig = "Eligible (GPA >= 3.2)" if student.Current_GPA >= 3.2 else "NOT Eligible (GPA < 3.2, needs to retake failed courses to raise GPA)"
    billing_desc = "Fully Paid" if student.Payment_Status == "Paid" else f"Unpaid (Outstanding balance: Rp {request.unpaid_bill:,.0f})"
    
    if request.user_message:
        prompt = f"""
You are TRACIA AI Mentor, a helpful academic advisor. Answer the student's question based on their academic profile.

Student Profile:
- Name: {request.student_name}
- NIM: {request.nim}
- Major: {request.major}
- Current GPA: {student.Current_GPA} ({gpa_standing})
- Scholarship Eligibility: {scholarship_elig}
- Credit Accumulation Velocity: {student.Credit_Accumulation_Velocity} SKS/semester
- Active KRS Courses: {", ".join(request.krs_courses) if request.krs_courses else "None"}
- Specific Failed Courses: {", ".join(request.failed_courses) if request.failed_courses else "None"}
- Dropout Risk Level: {pred['risk_level']} ({pred['dropout_risk_probability']*100}% probability)
- Attendance Rate: {student.Attendance_Rate}%
- Payment Status: {billing_desc}
- Gamification Progress: Level {request.level} ({request.xp} XP)

Student Question: "{request.user_message}"

Guidelines:
- You are strictly an academic advisor. If the question is NOT related to university studies, academics, GPA, courses, KRS, SKS, study tips, scholarships, tuition fees, or gamification level/XP, you MUST respond EXACTLY: "Sorry, I'm not programmed for this."
- Never say a GPA below 3.0 is "impressive" or "meets the threshold". It is NOT.
- If the student GPA is below 3.0, explain that they are in Critical/Warning standing and must focus on academic recovery (specifically retaking failed courses).
- If the question is about "level" or "xp" or gamification progress, answer specifically about their Level {request.level} and {request.xp} XP.
- If they ask about scholarships, refer to the Scholarship Eligibility status calculated above.
- Ensure all facts match the profile data exactly. Do not hallucinate or make up false compliments.
- Give a professional, encouraging, and highly specific response in English.
"""
    else:
        prompt = f"""
You are TRACIA AI Mentor, an academic advisor. Analyze this student profile and give 3 concise, actionable advice items.

Student Profile:
- Name: {request.student_name}
- NIM: {request.nim}
- Major: {request.major}
- Current GPA: {student.Current_GPA} ({gpa_standing})
- Scholarship Eligibility: {scholarship_elig}
- Credit Accumulation Velocity: {student.Credit_Accumulation_Velocity} SKS/semester
- Active KRS Courses: {", ".join(request.krs_courses) if request.krs_courses else "None"}
- Specific Failed Courses: {", ".join(request.failed_courses) if request.failed_courses else "None"}
- Dropout Risk Level: {pred['risk_level']} ({pred['dropout_risk_probability']*100}% probability)
- Attendance Rate: {student.Attendance_Rate}%
- Payment Status: {billing_desc}
- Gamification Progress: Level {request.level} ({request.xp} XP)

Guidelines:
- Give highly specific advice. If there are failed courses, name them specifically.
- Keep the advice professional, encouraging, supportive, and in English.
- Keep it under 100 words.
"""

    # 3. Call Ollama API
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5:0.5b",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 150
                }
            },
            timeout=30
        )
        response.raise_for_status()
        ollama_data = response.json()
        advice = ollama_data.get("response", "I'm sorry, I couldn't generate advice at this time.")
        
        return {
            "student_name": request.student_name,
            "risk_level": pred['risk_level'],
            "advice": advice.strip()
        }
    except Exception as e:
        failed_str = ", ".join(request.failed_courses) if request.failed_courses else "none"
        bill_str = f"Rp {request.unpaid_bill:,.0f}" if request.unpaid_bill > 0 else "none"
        return {
            "error": f"Ollama Error: {str(e)}",
            "fallback_advice": f"Hello {request.student_name} ({request.major}), your current GPA is {student.Current_GPA} and your risk level is {pred['risk_level']}. "
                               f"We recommend addressing your failed courses ({failed_str}) and outstanding balance ({bill_str}) to lower your risk."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=4322)
