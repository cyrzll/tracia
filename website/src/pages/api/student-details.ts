import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { Mhs, MhsKrs, MhsTranscript, MhsBilling } from '../../lib/schema';
import { eq } from 'drizzle-orm';
import { validateAdminSession } from '../../utils/auth';

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // 1. Authenticate Request
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse NIM Query Param
    const nim = url.searchParams.get('nim');
    if (!nim) {
      return new Response(
        JSON.stringify({ success: false, error: 'NIM parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Query Database in Parallel
    const [dbStudents, dbKrs, dbTranscript, dbBilling] = await Promise.all([
      db.select().from(Mhs).where(eq(Mhs.nim, nim)).limit(1),
      db.select().from(MhsKrs).where(eq(MhsKrs.nim, nim)),
      db.select().from(MhsTranscript).where(eq(MhsTranscript.nim, nim)),
      db.select().from(MhsBilling).where(eq(MhsBilling.nim, nim)).limit(1)
    ]);

    if (dbStudents.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Student not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const selectedStudent = dbStudents[0];

    // --- REAL-TIME AI PREDICTION CALCULATION ---
    const getGradeWeight = (grade: string) => {
      switch (grade.toUpperCase()) {
        case 'A': return 4.0;
        case 'AB': return 3.5;
        case 'B': return 3.0;
        case 'BC': return 2.5;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'E': return 0.0;
        default: return 0.0;
      }
    };

    const gradeToScore = (grade: string) => {
      switch (grade.toUpperCase()) {
        case 'A': return 90;
        case 'AB': return 80;
        case 'B': return 72;
        case 'BC': return 65;
        case 'C': return 58;
        case 'D': return 50;
        case 'E': return 30;
        default: return 75;
      }
    };

    // 4. Reconstruct KRS structure
    const krsMap = new Map<string, any[]>();
    dbKrs.forEach(row => {
      if (!krsMap.has(row.ta)) {
        krsMap.set(row.ta, []);
      }
      krsMap.get(row.ta)!.push({
        kdmk: row.kdmk,
        nmmk: row.nmmk,
        klpk: row.klpk,
        sks: row.sks,
        sts: row.status
      });
    });

    let currentKrsData = null;
    let pastKrsData: any[] = [];
    const sortedTas = Array.from(krsMap.keys()).sort();
    sortedTas.forEach((ta, idx) => {
      const isLast = idx === sortedTas.length - 1;
      const semKrs = {
        ta: ta,
        kode_ta: ta,
        krs: krsMap.get(ta)!
      };
      if (isLast) {
        currentKrsData = semKrs;
      } else {
        pastKrsData.push(semKrs);
      }
    });

    // 5. Reconstruct Transcript & KHS header format
    const transcriptData = dbTranscript.map(row => ({
      kdmk: row.kdmk,
      nmmk: row.nmmk,
      sks: row.sks,
      nl: row.nilai
    }));

    const totalSks = transcriptData.reduce((sum, item) => sum + Number(item.sks), 0);
    const gradeCounts = new Map<string, number>();
    transcriptData.forEach(item => {
      gradeCounts.set(item.nl, (gradeCounts.get(item.nl) || 0) + 1);
    });
    const total_nilai = Array.from(gradeCounts.entries()).map(([nilai, jumlah]) => ({
      nilai,
      jumlah
    }));

    const khsHeaderData = {
      total_sks: totalSks,
      ipk: selectedStudent.gpa,
      total_nilai
    };

    // 6. Calculate ML Features
    const activeSemester = (currentKrsData ? 1 : 0) + pastKrsData.length;
    const courseGrades = new Map();
    transcriptData.forEach((c) => {
      courseGrades.set(c.kdmk, c.nl);
    });

    const semesterGpas: number[] = [];
    pastKrsData.sort((a, b) => a.kode_ta.localeCompare(b.kode_ta)).forEach(sem => {
      let totalSksSem = 0;
      let totalPoints = 0;
      sem.krs.forEach((c: any) => {
        const grade = courseGrades.get(c.kdmk);
        if (grade) {
          totalSksSem += Number(c.sks);
          totalPoints += getGradeWeight(grade) * Number(c.sks);
        }
      });
      if (totalSksSem > 0) {
        semesterGpas.push(totalPoints / totalSksSem);
      }
    });

    let gpaTrend = 0.0;
    if (semesterGpas.length >= 2) {
      gpaTrend = semesterGpas[semesterGpas.length - 1] - semesterGpas[semesterGpas.length - 2];
    }

    const scores = transcriptData.map(c => gradeToScore(c.nl));
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 75;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 75;

    let scoreStd = 0.0;
    if (scores.length > 1) {
      const mean = averageScore;
      const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scores.length;
      scoreStd = Math.sqrt(variance);
    }

    const failedCourses = transcriptData.filter((c) => c.nl === 'D' || c.nl === 'E').length;
    
    // 7. Reconstruct Billing format
    let billingData = null;
    if (dbBilling.length > 0) {
      const b = dbBilling[0];
      billingData = {
        status: b.status,
        total_tagih: b.totalTagih,
        informasi: b.informasi,
        tahun_ajaran: b.ta,
        status_pembayaran: b.status.includes("TERBAYAR") ? "LUNAS" : "UTS",
        via: b.via,
        tanggal: b.tanggal,
        SKS_sekarang: 0,
        SPP_sekarang: 0,
        GDG_sekarang: 0,
        MOD_sekarang: 0,
        BK_sekarang: 0,
        POLI_sekarang: 0
      };
    }

    const paymentStatus = billingData && billingData.status.includes("TERBAYAR") ? "Paid" : "Unpaid";
    const velocity = activeSemester > 1 ? totalSks / (activeSemester - 1) : totalSks;

    // --- CALL ML API ---
    let latestRiskProb = selectedStudent.risk_probability;
    let latestRiskLevel = selectedStudent.risk_level;

    try {
      const payload = {
        "Semester": activeSemester,
        "Current_GPA": selectedStudent.gpa,
        "GPA_Trend": Number(gpaTrend.toFixed(4)),
        "Attendance_Rate": 0.95,
        "Credit_Accumulation_Velocity": Number(velocity.toFixed(2)),
        "Failed_Course_Count": failedCourses,
        "Total_Credits_Completed": totalSks,
        "Payment_Status": paymentStatus,
        "Average_Final_Score": Number(averageScore.toFixed(2)),
        "Highest_Final_Score": highestScore,
        "Lowest_Final_Score": lowestScore,
        "Final_Score_Std": Number(scoreStd.toFixed(4))
      };

      const predictRes = await fetch("http://127.0.0.1:4322/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (predictRes.ok) {
        const pred = await predictRes.json();
        latestRiskProb = pred.dropout_risk_probability;
        latestRiskLevel = pred.risk_level;

        // Sync to Database
        await db.update(Mhs).set({
          risk_probability: latestRiskProb,
          risk_level: latestRiskLevel,
          updatedAt: new Date()
        }).where(eq(Mhs.nim, nim));
        
        // Update local object for response
        selectedStudent.risk_probability = latestRiskProb;
        selectedStudent.risk_level = latestRiskLevel;
      }
    } catch (e) {
      console.error("ML Prediction failed in API:", e);
    }

    // 8. Set Visual Indicators
    const isBrainHealthy = selectedStudent.gpa >= 3.0;
    const isHeartHealthy = paymentStatus === "Paid";
    const isHandsHealthy = failedCourses === 0;
    const isFeetHealthy = velocity >= 12;

    return new Response(
      JSON.stringify({
        success: true,
        student: selectedStudent,
        currentKrsData,
        pastKrsData,
        billingData,
        transcriptData,
        khsHeaderData,
        isBrainHealthy,
        isHeartHealthy,
        isHandsHealthy,
        isFeetHealthy,
        velocity
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error fetching student details:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
