import { db } from '../lib/db';
import { User } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding initial users...');

  try {
    // 1. Clean up existing users
    await db.delete(User);

    // 2. Insert Super Admin
    await db.insert(User).values({
      uid: crypto.randomUUID(),
      username: 'admin',
      name: 'Super Admin',
      email: 'admin@dinus.ac.id',
      password: 'admin123',
      level: 'admin'
    });

    // 3. Insert Lecturers (Kaprodi)
    await db.insert(User).values([
      {
        uid: crypto.randomUUID(),
        username: 'kaprodi_ti',
        name: 'Kaprodi Teknik Informatika',
        email: 'ti@dinus.ac.id',
        password: 'password123',
        level: 'lecturer-F11'
      },
      {
        uid: crypto.randomUUID(),
        username: 'kaprodi_si',
        name: 'Kaprodi Sistem Informasi',
        email: 'si@dinus.ac.id',
        password: 'password123',
        level: 'lecturer-F12'
      }
    ]);

    console.log('✅ Initial users successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seed();
