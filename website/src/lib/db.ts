import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const host = import.meta.env.MYSQL_HOST || process.env.MYSQL_HOST;
const user = import.meta.env.MYSQL_USER || process.env.MYSQL_USER;
const password = import.meta.env.MYSQL_PASSWORD || process.env.MYSQL_PASSWORD;
const database = import.meta.env.MYSQL_DATABASE || process.env.MYSQL_DATABASE;

// Connection pool configuration
export const connection = mysql.createPool({
  host,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(connection, { schema, mode: 'default' });
