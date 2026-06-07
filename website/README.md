# TRACIA AI — Web Application (Astro SSR)

Ini adalah bagian aplikasi web untuk platform **TRACIA AI**, yang dibangun menggunakan framework **Astro** (dengan mode Server-Side Rendering) dan komponen **React** terhidrasi. Aplikasi ini terhubung ke database **MySQL** via **Drizzle ORM** dan terintegrasi dengan API Machine Learning untuk menampilkan prediksi risiko secara real-time.

---

## 🛠️ Stack Teknologi

*   **Framework**: [Astro v6](https://astro.build/) (mode SSR dengan adapter `@astrojs/node`)
*   **UI Components**: React v19, Tailwind CSS v4, Lucide React
*   **Database ORM**: Drizzle ORM dengan driver `mysql2`
*   **Email Dispatcher**: Nodemailer (SMTP)

---

## 📂 Struktur Folder Aplikasi

```text
website/
├── src/
│   ├── components/         # Komponen React (KrsAccordion, TranscriptView, ui/)
│   ├── layouts/            # Layout halaman global (Layout.astro)
│   ├── lib/                # Konfigurasi database Drizzle (db.ts & schema.ts)
│   ├── pages/              # Halaman routing aplikasi
│   │   ├── api/            # API Route (send-email.ts)
│   │   ├── dash/           # Dashboard (admin/ & mhs/)
│   │   ├── login/          # Halaman masuk sistem (login.astro)
│   │   └── index.astro     # Halaman utama (landing)
│   ├── scripts/            # Script sekali pakai (migrate-data.ts)
│   ├── styles/             # Pengaturan style global Tailwind (global.css)
│   └── utils/              # Helper utilitas JWT dan Sesi Autentikasi (auth.ts & jwt.ts)
├── drizzle/                # Output migrasi/skema SQL Drizzle Kit
├── drizzle.config.ts       # Konfigurasi Drizzle Kit untuk MySQL
├── astro.config.mjs        # Konfigurasi integrasi & adapter Astro
└── package.json            # Daftar dependensi dan script npm
```

---

## ⚙️ Variabel Lingkungan (`.env`)

Sebelum menjalankan aplikasi, pastikan Anda telah membuat berkas `.env` di dalam folder `website/` dengan konfigurasi berikut:

```env
# Database SQLite Lokal (Untuk referensi migrasi)
ASTRO_DATABASE_FILE=local.db

# Konfigurasi Server Email (SMTP)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email-user
SMTP_PASS=your-email-password
SMTP_FROM="Tracia Admin <your-email-user>"

# Konfigurasi Database MySQL
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-mysql-database
```

---

## 🧞 Perintah Terminal (Commands)

Semua perintah dijalankan di dalam direktori `website/`:

| Perintah | Deskripsi |
| :--- | :--- |
| `bun install` | Mengunduh dan memasang semua dependensi aplikasi. |
| `bunx drizzle-kit push` | Menyinkronkan struktur skema Drizzle langsung ke database MySQL. |
| `bun src/scripts/migrate-data.ts` | Menyalin semua data lama dari file `local.db` (SQLite) ke MySQL. |
| `bun run dev` | Menjalankan server pengembangan lokal pada [http://localhost:4001/](http://localhost:4001/). |
| `bun run build` | Membuat bundel produksi aplikasi di dalam folder `./dist/`. |
| `bun run preview` | Menjalankan pratinjau hasil build secara lokal sebelum dideploy. |
