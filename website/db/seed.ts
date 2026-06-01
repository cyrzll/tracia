import { db, User } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(User).values([
    {
      id: 1,
      uid: 'admin-1111-2222',
      username: 'admin',
      name: 'Administrator Utama',
      password: 'admin123',
      email: 'admin@tracia.ai',
      level: 'admin'
    }
  ]);
}

