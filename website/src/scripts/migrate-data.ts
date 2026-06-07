import { Database } from "bun:sqlite";
import { db } from "../lib/db";
import { User, Mhs, MhsKrs, MhsTranscript, MhsBilling } from "../lib/schema";
import { existsSync } from "fs";
import { join } from "path";

const sqliteDbPath = join(process.cwd(), "local.db");

if (!existsSync(sqliteDbPath)) {
  console.error(`SQLite file not found at ${sqliteDbPath}`);
  process.exit(1);
}

const sqlite = new Database(sqliteDbPath);

async function migrate() {
  console.log("Starting migration from SQLite to MySQL...");

  try {
    // 1. Migrate User table
    const users = sqlite.query("SELECT * FROM User").all() as any[];
    console.log(`Found ${users.length} users in SQLite.`);
    if (users.length > 0) {
      await db.delete(User);
      await db.insert(User).values(users.map(u => ({
        id: u.id,
        uid: u.uid,
        username: u.username,
        name: u.name,
        password: u.password,
        email: u.email,
        level: u.level
      })));
      console.log("Migrated User table.");
    }

    // 2. Migrate Mhs table
    const mhsList = sqlite.query("SELECT * FROM Mhs").all() as any[];
    console.log(`Found ${mhsList.length} students in SQLite.`);
    if (mhsList.length > 0) {
      await db.delete(Mhs);
      await db.insert(Mhs).values(mhsList.map(m => ({
        nim: m.nim,
        nama: m.nama,
        email: m.email,
        gender: m.gender,
        foto: m.foto,
        gpa: Number(m.gpa),
        sks: Number(m.sks),
        semester: Number(m.semester),
        risk_probability: Number(m.risk_probability),
        risk_level: m.risk_level,
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date()
      })));
      console.log("Migrated Mhs table.");
    }

    // 3. Migrate MhsKrs table
    const krsList = sqlite.query("SELECT * FROM MhsKrs").all() as any[];
    console.log(`Found ${krsList.length} KRS entries in SQLite.`);
    if (krsList.length > 0) {
      await db.delete(MhsKrs);
      await db.insert(MhsKrs).values(krsList.map(k => ({
        id: k.id,
        nim: k.nim,
        ta: k.ta,
        kdmk: k.kdmk,
        nmmk: k.nmmk,
        klpk: k.klpk,
        sks: Number(k.sks),
        status: k.status
      })));
      console.log("Migrated MhsKrs table.");
    }

    // 4. Migrate MhsTranscript table
    const transcriptList = sqlite.query("SELECT * FROM MhsTranscript").all() as any[];
    console.log(`Found ${transcriptList.length} transcript entries in SQLite.`);
    if (transcriptList.length > 0) {
      await db.delete(MhsTranscript);
      await db.insert(MhsTranscript).values(transcriptList.map(t => ({
        id: t.id,
        nim: t.nim,
        kdmk: t.kdmk,
        nmmk: t.nmmk,
        sks: Number(t.sks),
        nilai: t.nilai
      })));
      console.log("Migrated MhsTranscript table.");
    }

    // 5. Migrate MhsBilling table
    const billingList = sqlite.query("SELECT * FROM MhsBilling").all() as any[];
    console.log(`Found ${billingList.length} billing entries in SQLite.`);
    if (billingList.length > 0) {
      await db.delete(MhsBilling);
      await db.insert(MhsBilling).values(billingList.map(b => ({
        nim: b.nim,
        ta: b.ta,
        status: b.status,
        totalTagih: Number(b.totalTagih),
        informasi: b.informasi,
        via: b.via,
        tanggal: b.tanggal
      })));
      console.log("Migrated MhsBilling table.");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
