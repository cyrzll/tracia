# TRACIA AI — Student Risk Predictor

TRACIA AI adalah platform analitik akademis terintegrasi yang bertujuan untuk mendeteksi dini risiko kegagalan studi (dropout) mahasiswa secara real-time. Platform ini menggabungkan model prediksi **Machine Learning (XGBoost)** di sisi backend, web interface interaktif berbasis **Astro & React**, dan penyimpanan database relasional **MySQL (Drizzle ORM)**.

---

## 📂 Struktur Repositori

Repositori ini terdiri dari dua bagian utama:
*   **`notebooks/`**: Layanan machine learning berbasis Python (FastAPI).
    *   `training.py`: Melatih model klasifikasi menggunakan algoritma XGBoost.
    *   `app.py`: Menyediakan endpoint API `/predict` untuk memproses probabilitas risiko.
*   **`website/`**: Aplikasi web berbasis Astro SSR (Server-Side Rendering).
    *   `src/pages/dash/admin/index.astro`: Dashboard administrator untuk memantau performa, KRS, transkrip, serta mengirim notifikasi bimbingan akademik.
    *   `src/pages/dash/mhs/index.astro`: Portal mahasiswa untuk memantau status akademik mereka secara mandiri.
    *   `src/pages/api/send-email.ts`: API endpoint untuk mengirim notifikasi bimbingan ke email mahasiswa.
    *   `src/lib/db.ts` & `src/lib/schema.ts`: Konfigurasi database Drizzle ORM menggunakan database MySQL.

---

## ⚡ Fitur Utama

1.  **AI Dropout Prediction**: Model ML menganalisis 12 parameter penting termasuk tren IPK, akumulasi SKS, kecepatan penyelesaian SKS, rasio kehadiran, mata kuliah gagal, dan status pembayaran biaya kuliah.
2.  **Visualisasi Anatomi Risiko**: Indikator anatomis tubuh manusia untuk memetakan kesehatan studi mahasiswa (Otak 🧠 untuk IPK, Jantung ❤️ untuk Pembayaran, Tangan 💪 untuk Kelulusan Mata Kuliah, Kaki 👣 untuk Kehadiran).
3.  **Sistem Bimbingan Email Terintegrasi**: Administrator dapat mengirimkan email bimbingan akademik secara instan melalui modal pop-up langsung dari dashboard.
4.  **MySQL Database & Drizzle ORM**: Manajemen data terpusat menggunakan server MySQL dengan performa query tinggi.

---

## 🛠️ Panduan Instalasi & Penggunaan

### 1. Menjalankan Machine Learning API (FastAPI)

1.  Masuk ke direktori `notebooks`:
    ```bash
    cd notebooks
    ```
2.  Aktifkan virtual environment Python dan pasang dependensi:
    ```bash
    source bin/activate  # Untuk macOS/Linux
    pip install -r requirements.txt
    ```
3.  (Opsional) Jika model belum dilatih, latih model terlebih dahulu:
    ```bash
    python training.py
    ```
4.  Jalankan server API FastAPI (berjalan pada port `4322`):
    ```bash
    python app.py
    ```

### 2. Menjalankan Aplikasi Web (Astro)

1.  Masuk ke direktori `website`:
    ```bash
    cd website
    ```
2.  Pasang dependensi menggunakan Bun:
    ```bash
    bun install
    ```
3.  Konfigurasikan file `.env` di dalam folder `website/` dengan kredensial server email (SMTP) dan database MySQL Anda:
    ```env
    # MAIL SERVER (SMTP)
    SMTP_HOST=your-smtp-host
    SMTP_PORT=587
    SMTP_USER=your-email-user
    SMTP_PASS=your-email-password
    SMTP_FROM="Tracia Admin <your-email-user>"

    # MYSQL SERVER
    MYSQL_HOST=your-mysql-host
    MYSQL_USER=your-mysql-user
    MYSQL_PASSWORD=your-mysql-password
    MYSQL_DATABASE=your-mysql-database
    ```
4.  Sinkronisasikan skema Drizzle ORM ke server MySQL Anda:
    ```bash
    bunx drizzle-kit push
    ```
5.  Migrasikan data awal dari SQLite (`local.db`) ke MySQL VPS Anda:
    ```bash
    bun src/scripts/migrate-data.ts
    ```
6.  Jalankan server pengembangan Astro (berjalan pada port `4001`):
    ```bash
    bun run dev
    ```

---

## 📝 Kontak & Lisensi

Dibuat untuk keperluan kompetisi Hackathon Student Risk Predictor. Seluruh hak cipta dilindungi oleh tim TRACIA AI &copy; 2026.
