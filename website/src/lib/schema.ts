import { mysqlTable, varchar, double, int, text, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const User = mysqlTable('User', {
  id: int('id').primaryKey().autoincrement(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  level: varchar('level', { length: 50 }).default('admin').notNull(),
});

export const Mhs = mysqlTable('Mhs', {
  nim: varchar('nim', { length: 50 }).primaryKey(),
  nama: text('nama').notNull(),
  email: text('email').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  foto: text('foto').notNull(),
  gpa: double('gpa').notNull(),
  sks: int('sks').notNull(),
  semester: int('semester').notNull(),
  risk_probability: double('risk_probability').notNull(),
  risk_level: varchar('risk_level', { length: 50 }).notNull(),
  updatedAt: datetime('updatedAt').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const MhsKrs = mysqlTable('MhsKrs', {
  id: int('id').primaryKey().autoincrement(),
  nim: varchar('nim', { length: 50 }).notNull(),
  ta: varchar('ta', { length: 50 }).notNull(),
  kdmk: varchar('kdmk', { length: 50 }).notNull(),
  nmmk: text('nmmk').notNull(),
  klpk: varchar('klpk', { length: 50 }).notNull(),
  sks: int('sks').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
});

export const MhsTranscript = mysqlTable('MhsTranscript', {
  id: int('id').primaryKey().autoincrement(),
  nim: varchar('nim', { length: 50 }).notNull(),
  kdmk: varchar('kdmk', { length: 50 }).notNull(),
  nmmk: text('nmmk').notNull(),
  sks: int('sks').notNull(),
  nilai: varchar('nilai', { length: 10 }).notNull(),
});

export const MhsBilling = mysqlTable('MhsBilling', {
  nim: varchar('nim', { length: 50 }).primaryKey(),
  ta: varchar('ta', { length: 50 }).notNull(),
  status: varchar('status', { length: 255 }).notNull(),
  totalTagih: double('totalTagih').notNull(),
  informasi: text('informasi').notNull(),
  via: varchar('via', { length: 255 }).notNull(),
  tanggal: varchar('tanggal', { length: 100 }).notNull(),
});
