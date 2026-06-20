import { db } from '../lib/db';
import { Mhs, MhsKrs, MhsTranscript, MhsBilling, MhsChat } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const nim = 'F11.2024.99999';
  console.log(`🌱 Seeding dummy student: ${nim}...`);

  try {
    // 1. Clean up existing data for this NIM
    await db.delete(MhsKrs).where(eq(MhsKrs.nim, nim));
    await db.delete(MhsTranscript).where(eq(MhsTranscript.nim, nim));
    await db.delete(MhsBilling).where(eq(MhsBilling.nim, nim));
    await db.delete(MhsChat).where(eq(MhsChat.nim, nim));
    await db.delete(Mhs).where(eq(Mhs.nim, nim));

    // 2. Insert Mhs
    await db.insert(Mhs).values({
      nim: nim,
      nama: 'Budi Santoso',
      email: 'budi@mhs.dinus.ac.id',
      gender: 'Laki-laki',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
      gpa: 1.72,
      sks: 25,
      semester: 3,
      risk_probability: 0.94,
      risk_level: 'High'
    });

    // 3. Insert KRS (Current Semester)
    await db.insert(MhsKrs).values([
      {
        nim: nim,
        ta: '2024/2025 Ganjil',
        kdmk: 'A11.001',
        nmmk: 'Basis Data',
        klpk: 'A11.4301',
        sks: 4,
        status: 'BARU'
      },
      {
        nim: nim,
        ta: '2024/2025 Ganjil',
        kdmk: 'A11.002',
        nmmk: 'Pemrograman Web',
        klpk: 'A11.4301',
        sks: 4,
        status: 'BARU'
      }
    ]);

    // 4. Insert Transcript (Past Semesters)
    await db.insert(MhsTranscript).values([
      { nim: nim, kdmk: 'A11.101', nmmk: 'Dasar Pemrograman', sks: 4, nilai: 'B' },
      { nim: nim, kdmk: 'A11.102', nmmk: 'Matematika Diskrit', sks: 3, nilai: 'E' },
      { nim: nim, kdmk: 'A11.103', nmmk: 'Logika Informatika', sks: 3, nilai: 'B' },
      { nim: nim, kdmk: 'A11.104', nmmk: 'Struktur Data', sks: 4, nilai: 'D' },
      { nim: nim, kdmk: 'A11.105', nmmk: 'Pemrograman Berorientasi Objek', sks: 4, nilai: 'E' },
      { nim: nim, kdmk: 'A11.106', nmmk: 'Jaringan Komputer', sks: 4, nilai: 'B' },
      { nim: nim, kdmk: 'A11.107', nmmk: 'Rekayasa Perangkat Lunak', sks: 3, nilai: 'C' }
    ]);

    // 5. Insert Billing
    await db.insert(MhsBilling).values({
      nim: nim,
      ta: '2024/2025 Ganjil',
      status: 'BELUM TERBAYAR',
      totalTagih: 5000000,
      informasi: 'Cicilan ke-1 (SPP & SKS)',
      via: 'Bank Jateng',
      tanggal: '2024-09-01'
    });

    // 6. Insert Initial Chat Messages
    await db.insert(MhsChat).values([
      {
        nim: nim,
        sender: 'ai',
        text: 'Hello Budi! I am TRACIA, your AI Academic Mentor. I noticed your GPA is currently 2.75. How can I help you improve your study plan?',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      },
      {
        nim: nim,
        sender: 'user',
        text: 'Hi TRACIA, I am worried about my grades. What should I do?',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    console.log('✅ Budi Santoso successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Budi Santoso:', error);
    process.exit(1);
  }
}

seed();
