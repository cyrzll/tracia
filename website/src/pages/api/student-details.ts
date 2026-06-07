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

    // 6. Reconstruct Billing format
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

    // 7. Set Visual Indicators
    const isBrainHealthy = selectedStudent.gpa >= 3.0;
    const isHeartHealthy = !!(billingData && billingData.status.includes("TERBAYAR"));
    const isHandsHealthy = transcriptData.filter(c => c.nl === 'D' || c.nl === 'E').length === 0;
    const velocity = selectedStudent.semester > 1 ? selectedStudent.sks / (selectedStudent.semester - 1) : selectedStudent.sks;
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
