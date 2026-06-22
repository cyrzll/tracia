from pydantic import BaseModel
from typing import List

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
    krs_courses: List[str] = []
    failed_courses: List[str] = []
    unpaid_bill: float = 0.0
    level: int = 1
    xp: int = 0
