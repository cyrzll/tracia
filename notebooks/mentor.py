import requests
from schemas import MentorRequest
from prompt_validator import validate_message_context
from predictor import get_prediction_internal

def generate_mentor_advice(request: MentorRequest):
    """
    Validates message context, processes deterministic academic rules, constructs Ollama templates,
    and calls Qwen 0.5B to generate student-centric advice.
    """
    # 1. Get Prediction
    pred = get_prediction_internal(request.student_data)
    if pred is None:
        return None
    
    student = request.student_data
    lower = request.user_message.lower() if request.user_message else ""

    # Context verification pre-check
    if request.user_message and not validate_message_context(request.user_message):
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
