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

def validate_message_context(user_message: str) -> bool:
    """
    Validates if the user message is within the TRACIA AI Mentor context.
    Returns True if user_message matches any core academic keyword or general greeting,
    otherwise returns False.
    """
    if not user_message:
        return True
        
    lower_message = user_message.lower()
    
    # Check core academic keywords
    for word in CORE_ACADEMIC_KEYWORDS:
        if word in lower_message:
            return True
            
    # Check greetings and fallbacks
    for word in GREETINGS_AND_FALLBACKS:
        if word in lower_message:
            return True
            
    return False
