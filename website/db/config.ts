import { defineDb, defineTable, column, NOW } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    uid: column.text({ unique: true }),
    username: column.text({ unique: true }),
    name: column.text(),
    password: column.text(),
    email: column.text({ unique: true }),
    level: column.text({ default: 'admin' }),
  }
});

const Mhs = defineTable({
  columns: {
    nim: column.text({ primaryKey: true }),
    nama: column.text(),
    email: column.text(),
    gender: column.text(),
    foto: column.text(),
    gpa: column.number(),
    sks: column.number(),
    semester: column.number(),
    risk_probability: column.number(),
    risk_level: column.text(),
    updatedAt: column.date({ default: NOW }),
  }
});

const MhsKrs = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    nim: column.text(),
    ta: column.text(),
    kdmk: column.text(),
    nmmk: column.text(),
    klpk: column.text(),
    sks: column.number(),
    status: column.text(),
  }
});

const MhsTranscript = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    nim: column.text(),
    kdmk: column.text(),
    nmmk: column.text(),
    sks: column.number(),
    nilai: column.text(),
  }
});

const MhsBilling = defineTable({
  columns: {
    nim: column.text({ primaryKey: true }),
    ta: column.text(),
    status: column.text(),
    totalTagih: column.number(),
    informasi: column.text(),
    via: column.text(),
    tanggal: column.text(),
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: { User, Mhs, MhsKrs, MhsTranscript, MhsBilling }
});



