# Student Dropout Prediction (Advanced ML Edition) 🎓🚀

**Student Dropout Prediction** adalah solusi Machine Learning mutakhir yang dikembangkan untuk mengidentifikasi dan menganalisis risiko dropout mahasiswa. Proyek ini menggunakan algoritma **XGBoost** yang dioptimalkan secara otomatis menggunakan **Optuna**, serta integrasi **SHAP** untuk transparansi model (Explainable AI).

Tujuan utamanya adalah menyediakan alat proaktif bagi institusi pendidikan untuk memprediksi risiko sekaligus memahami faktor penyebabnya, sehingga intervensi dapat dilakukan tepat sasaran.

---

## ✨ Fitur Utama
- **Balanced Performance**: Menggunakan **XGBoost** yang dioptimalkan untuk mencapai akurasi yang realistis (~80-90%) guna menghindari overfitting.
- **Auto-Tuning**: Pencarian hyperparameter otomatis (learning rate, depth, dll.) untuk performa terbaik.
- **Explainable AI (XAI)**: Menggunakan **SHAP Summary Plot** untuk membedah bagaimana fitur seperti GPA atau kehadiran memengaruhi risiko.
- **Data Export**: Secara otomatis mengekspor dataset yang telah di-preprocess ke format CSV untuk analisis lebih lanjut.
- **Single Pipeline Persistence**: Menyimpan seluruh proses (Preprocessing + XGBoost) ke dalam satu file `.pkl`.
- **FastAPI Integration**: Siap digunakan sebagai layanan API untuk prediksi real-time.

## 🛠️ Tech Stack
- **AI/ML**: Python 3.x, Scikit-Learn, XGBoost
- **Optimization**: Optuna
- **Explainability**: SHAP (TreeExplainer)
- **Data Ops**: Pandas, NumPy, Joblib
- **Visualization**: Matplotlib, Seaborn
- **Backend**: FastAPI & Uvicorn

---

## 📦 Instalasi & Setup

Clone repositori dan masuk ke folder proyek:
```bash
git clone https://github.com/tracia-AI/Student-Risk-Predictor.git
cd Student-Risk-Predictor/notebook
```

### 🍎 MAC OS / 🐧 LINUX
1. **Buat Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. **Install Dependensi**:
   ```bash
   pip install -r requirements.txt
   ```

### 💻 WINDOWS
1. **Buat Virtual Environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. **Install Dependensi**:
   ```powershell
   pip install -r requirements.txt
   ```

---

## 🚀 Cara Menjalankan

### 1. Pelatihan & Optimasi (training.py)
Jalankan skrip ini untuk melakukan tuning otomatis, melatih model, dan mengekspor data.
```bash
python training.py
```
**Output:**
- `model/dropout_pipeline.pkl`: Pipeline model akhir.
- `model/shap_summary.png`: Visualisasi pengaruh fitur.
- `../dataset/student_dropout_prediction_after_preprocessing.csv`: Dataset hasil preprocessing.

### 2. Menjalankan API (app.py)
Gunakan uvicorn untuk menjalankan server API.
```bash
uvicorn app:app --reload
```

---

## 🔌 API Endpoints

Secara default, server API berjalan pada `http://127.0.0.1:4000`. Anda juga dapat mengakses dokumentasi interaktif API (Swagger UI) langsung di `http://127.0.0.1:4000/docs`.

### 1. Home / Status Check
Memeriksa apakah server API sedang berjalan dengan baik.

- **URL**: `/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "message": "Student Dropout Prediction API is running (CORS Enabled)"
  }
  ```

### 2. Predict Student Dropout
Memprediksi risiko dropout mahasiswa berdasarkan data akademis dan keuangan.

- **URL**: `/predict`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body (JSON)**:
  - `Semester` (*int*): Semester aktif mahasiswa saat ini (contoh: `3`).
  - `Current_GPA` (*float*): IPK saat ini (contoh: `2.8`).
  - `GPA_Trend` (*float*): Tren kenaikan/penurunan IPK dibandingkan semester sebelumnya (contoh: `-0.15`).
  - `Attendance_Rate` (*float*): Rasio kehadiran kelas, rentang `0.0` sampai `1.0` (contoh: `0.85`).
  - `Credit_Accumulation_Velocity` (*float*): Kecepatan akumulasi SKS per semester (contoh: `15.0`).
  - `Failed_Course_Count` (*int*): Jumlah mata kuliah yang tidak lulus (contoh: `1`).
  - `Total_Credits_Completed` (*int*): Total SKS yang telah selesai (contoh: `42`).
  - `Payment_Status` (*str*): Status pembayaran uang kuliah (`"Paid"` atau `"Unpaid"`).
  - `Average_Final_Score` (*float*): Rata-rata nilai ujian/tugas akhir (contoh: `72.5`).
  - `Highest_Final_Score` (*float*): Nilai ujian/tugas akhir tertinggi (contoh: `85.0`).
  - `Lowest_Final_Score` (*float*): Nilai ujian/tugas akhir terendah (contoh: `60.0`).
  - `Final_Score_Std` (*float*): Standar deviasi nilai akhir mahasiswa (contoh: `8.5`).

  **Contoh Request Payload:**
  ```json
  {
    "Semester": 3,
    "Current_GPA": 2.8,
    "GPA_Trend": -0.15,
    "Attendance_Rate": 0.85,
    "Credit_Accumulation_Velocity": 15.0,
    "Failed_Course_Count": 1,
    "Total_Credits_Completed": 42,
    "Payment_Status": "Unpaid",
    "Average_Final_Score": 72.5,
    "Highest_Final_Score": 85.0,
    "Lowest_Final_Score": 60.0,
    "Final_Score_Std": 8.5
  }
  ```

- **Response (JSON)**:
  - `prediction` (*str*): Hasil prediksi dropout (`"Yes"` jika berisiko dropout, `"No"` jika aman).
  - `dropout_risk_probability` (*float*): Nilai probabilitas dropout dalam rentang `0.0` hingga `1.0`.
  - `risk_level` (*str*): Kategori tingkat risiko dropout mahasiswa:
    - `High`: Probabilitas >= `0.5` (Berisiko Dropout)
    - `Medium`: Probabilitas `0.2` - `0.5`
    - `Low`: Probabilitas < `0.2`

  **Contoh Response Payload:**
  ```json
  {
    "prediction": "Yes",
    "dropout_risk_probability": 0.7512,
    "risk_level": "High"
  }
  ```

---

## 📊 Insight & Visualisasi
Setelah menjalankan pelatihan, Anda akan mendapatkan:
1. **Metrik Performa**: Laporan akurasi, F1-Score, dan ROC-AUC yang sangat mendetail.
2. **SHAP Insight**: Peta pengaruh fitur yang menunjukkan secara visual mengapa seorang mahasiswa diprediksi berisiko (misalnya: gagal mata kuliah atau tren IPK menurun).