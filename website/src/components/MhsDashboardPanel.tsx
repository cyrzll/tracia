import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { KrsAccordion } from "./KrsAccordion"
import { TranscriptView } from "./TranscriptView"
import type { Student, Billing, SemesterKrs, CourseGrade, KhsHeader } from "@/types"

interface MhsDashboardPanelProps {
  student: Student;
  currentKrs: SemesterKrs | null;
  pastKrs: SemesterKrs[] | null;
  billing: Billing | null;
  transcript: CourseGrade[] | null;
  khsHeader: KhsHeader | null;
  prediction: {
    risk_level: string;
    dropout_risk_probability: number;
  } | null;
  isBrainHealthy: boolean;
  isHeartHealthy: boolean;
  isHandsHealthy: boolean;
  isFeetHealthy: boolean;
  velocity: number;
}

export function MhsDashboardPanel({
  student,
  currentKrs,
  pastKrs,
  billing,
  transcript,
  khsHeader,
  prediction,
  isBrainHealthy,
  isHeartHealthy,
  isHandsHealthy,
  isFeetHealthy,
  velocity
}: MhsDashboardPanelProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const failedCourses = transcript ? transcript.filter(c => c.nl === 'D' || c.nl === 'E').length : 0;

  return (
    <div className="space-y-8">
      {/* Profile Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Foto Card */}
        <div className="md:col-span-1">
          <Card className="shadow-sm border border-zinc-200 bg-white overflow-hidden text-center p-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded border border-zinc-200 overflow-hidden bg-zinc-50 mb-4 relative shadow-inner">
              <img 
                src={student.foto} 
                alt={student.nama} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide leading-snug">{student.nama}</h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">{student.nim}</p>
          </Card>
        </div>

        {/* Detail Profile Grid */}
        <div className="md:col-span-2">
          <Card className="shadow-sm border border-zinc-200 bg-white h-full">
            <CardHeader className="border-b border-zinc-150 p-5 bg-zinc-50/50">
              <CardTitle className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Informasi Mahasiswa</CardTitle>
              <CardDescription className="text-zinc-500">Detail data diri mahasiswa yang tercatat pada sistem akademik SIADIN.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nama Lengkap</span>
                  <span className="text-xs font-semibold text-zinc-900 mt-1 block">{student.nama}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">NIM (Nomor Induk Mahasiswa)</span>
                  <span className="text-xs font-mono font-semibold text-zinc-900 mt-1 block">{student.nim}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Kampus</span>
                  <span className="text-xs font-mono text-zinc-900 mt-1 block">{student.email}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Jenis Kelamin</span>
                  <span className="text-xs font-semibold text-zinc-900 mt-1 block">
                    {student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : student.gender}
                  </span>
                </div>
              </div>

              <div className="border border-zinc-200 bg-zinc-50/40 p-4 rounded text-xs leading-relaxed text-zinc-500">
                <span className="font-bold text-zinc-700 block mb-1">Catatan Akses Mahasiswa</span>
                Sebagai mahasiswa, Anda memiliki akses untuk memantau status registrasi dan profil akademik Anda. Untuk analisis risiko dropout tingkat lanjut, silakan hubungi dosen wali atau bagian administrasi akademik.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dropout Risk AI Prediction Card */}
      {prediction ? (
        <Card className="shadow-sm border border-zinc-200 bg-white">
          <CardHeader className="border-b border-zinc-150 p-5 bg-zinc-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Analisis Risiko Akademik (AI Dropout Prediction)</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 mt-1 leading-snug">Prediksi risiko kegagalan studi mahasiswa secara real-time menggunakan algoritma Machine Learning XGBoost.</CardDescription>
              </div>
              <Badge 
                variant={prediction.risk_level === "Low" ? "outline" : "default"}
                className={`text-[9px] px-2 py-0.5 font-bold uppercase border-zinc-300 ${
                  prediction.risk_level === "Low" 
                    ? "bg-zinc-50 text-zinc-800" 
                    : prediction.risk_level === "Medium"
                    ? "bg-zinc-850 text-zinc-50"
                    : "bg-zinc-950 text-zinc-50 border-2 border-black"
                }`}
              >
                Risiko {prediction.risk_level === "Low" ? "Rendah" : prediction.risk_level === "Medium" ? "Sedang" : "Tinggi"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
              {/* Risk Percentage Display */}
              <div className="lg:col-span-1 text-center lg:border-r lg:border-zinc-200 lg:pr-6 flex flex-col justify-center items-center">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Probabilitas Dropout</span>
                <span className="text-4xl font-black text-zinc-950 tracking-tighter block mt-2">{(prediction.dropout_risk_probability * 100).toFixed(2)}%</span>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mt-4 mx-auto max-w-[200px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      prediction.risk_level === "Low" 
                        ? "bg-zinc-400" 
                        : prediction.risk_level === "Medium" 
                        ? "bg-zinc-700" 
                        : "bg-zinc-950"
                    }`}
                    style={{ width: `${(prediction.dropout_risk_probability * 100)}%` }}
                  />
                </div>
              </div>

              {/* Explainability Details */}
              <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Hasil Analisis Model</span>
                  <p className="text-xs text-zinc-655 mt-1.5 leading-relaxed font-medium">
                    {prediction.risk_level === "Low" ? (
                      "Performa akademik Anda berada dalam kondisi aman dengan tingkat kestabilan tinggi. Pertahankan nilai IPK Kumulatif Anda dan kecepatan penyelesaian SKS Anda di semester berikutnya."
                    ) : prediction.risk_level === "Medium" ? (
                      "Model mendeteksi adanya indikator risiko dropout tingkat menengah. Disarankan untuk meninjau kembali tingkat kehadiran kuliah, tren pencapaian IPK, serta memastikan tidak ada pembayaran tagihan yang terlambat."
                    ) : (
                      "PENTING: Model mendeteksi tingkat risiko dropout yang tinggi. Hal ini dipicu oleh tren penurunan IPK yang signifikan, adanya mata kuliah yang tidak lulus, keterlambatan pembayaran biaya kuliah, atau tingkat kehadiran yang rendah. Segera hubungi Dosen Wali Anda."
                    )}
                  </p>
                </div>

                <div className="border-t border-zinc-150 pt-3">
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Parameter Input AI</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono text-zinc-500">
                    <div>
                      <span className="text-zinc-400">Semester:</span>
                      <span className="font-bold text-zinc-800 ml-1">{student.semester}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">IPK Kumulatif:</span>
                      <span className="font-bold text-zinc-800 ml-1">{student.gpa.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Kehadiran (Rasio):</span>
                      <span className="font-bold text-zinc-800 ml-1">95.00%</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Kecepatan SKS:</span>
                      <span className="font-bold text-zinc-800 ml-1">{velocity.toFixed(2)}/sem</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">MK Gagal:</span>
                      <span className="font-bold text-zinc-800 ml-1">{failedCourses}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Status Bayar:</span>
                      <span className="font-bold text-zinc-800 ml-1">{billing && billing.status.includes("TERBAYAR") ? "Paid" : "Unpaid"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Anatomy Node */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center lg:border-l lg:border-zinc-200 lg:pl-6 py-2">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center w-full">Visualisasi Anatomi Risiko</span>
                
                <div className="flex items-center gap-4 w-full justify-between">
                  <div className="relative flex-shrink-0">
                    <svg viewBox="0 0 120 220" className="w-16 h-auto text-zinc-900" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="60" cy="30" r="14" className="stroke-zinc-200" />
                      <line x1="60" y1="44" x2="60" y2="60" className="stroke-zinc-200" />
                      <path d="M 45 60 L 75 60 L 70 120 L 50 120 Z" className="stroke-zinc-200 fill-zinc-50/20" />
                      <path d="M 43 60 C 30 80, 28 100, 32 120" className="stroke-zinc-200" />
                      <path d="M 77 60 C 90 80, 92 100, 88 120" className="stroke-zinc-200" />
                      <path d="M 52 120 L 48 160 L 50 200" className="stroke-zinc-200" />
                      <path d="M 68 120 L 72 160 L 70 200" className="stroke-zinc-200" />
                      
                      {isBrainHealthy ? (
                        <circle cx="60" cy="30" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                      ) : (
                        <g>
                          <circle cx="60" cy="30" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                          <circle cx="60" cy="30" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                        </g>
                      )}

                      {isHeartHealthy ? (
                        <circle cx="60" cy="75" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                      ) : (
                        <g>
                          <circle cx="60" cy="75" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                          <circle cx="60" cy="75" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                        </g>
                      )}

                      {isHandsHealthy ? (
                        <>
                          <circle cx="32" cy="120" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                          <circle cx="88" cy="120" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                        </>
                      ) : (
                        <g>
                          <circle cx="32" cy="120" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                          <circle cx="32" cy="120" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                          <circle cx="88" cy="120" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" stroke-width="1" />
                          <circle cx="88" cy="120" r="3.5" className="fill-zinc-950 stroke-zinc-950" stroke-width="1" />
                        </g>
                      )}

                      {isFeetHealthy ? (
                        <>
                          <circle cx="50" cy="200" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                          <circle cx="70" cy="200" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                        </>
                      ) : (
                        <g>
                          <circle cx="50" cy="200" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" stroke-width="1" />
                          <circle cx="50" cy="200" r="3.5" className="fill-zinc-950 stroke-zinc-950" stroke-width="1" />
                          <circle cx="70" cy="200" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" stroke-width="1" />
                          <circle cx="70" cy="200" r="3.5" className="fill-zinc-950 stroke-zinc-950" stroke-width="1" />
                        </g>
                      )}
                    </svg>
                  </div>

                  <div className="flex-1 space-y-3 text-[10px] leading-snug">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        🧠 Otak (GPA)
                        <span className={`w-1.5 h-1.5 rounded-full ${isBrainHealthy ? 'bg-zinc-400' : 'bg-zinc-950 animate-pulse'}`}></span>
                      </span>
                      <span className="text-zinc-550 font-mono pl-4">{student.gpa.toFixed(2)} IPK</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        ❤️ Jantung (Bayar)
                        <span className={`w-1.5 h-1.5 rounded-full ${isHeartHealthy ? 'bg-zinc-400' : 'bg-zinc-950 animate-pulse'}`}></span>
                      </span>
                      <span className="text-zinc-550 pl-4">{isHeartHealthy ? "Lunas" : "Tunggakan"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        💪 Tangan (SKS)
                        <span className={`w-1.5 h-1.5 rounded-full ${isHandsHealthy ? 'bg-zinc-400' : 'bg-zinc-950 animate-pulse'}`}></span>
                      </span>
                      <span className="text-zinc-550 pl-4">{khsHeader ? khsHeader.total_sks : 0} SKS ({failedCourses} MK Gagal)</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        👣 Kaki (Hadir)
                        <span className={`w-1.5 h-1.5 rounded-full ${isFeetHealthy ? 'bg-zinc-400' : 'bg-zinc-950 animate-pulse'}`}></span>
                      </span>
                      <span className="text-zinc-550 font-mono pl-4">95% ({velocity.toFixed(1)}/sem)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border border-zinc-200 bg-white p-5 text-center">
          <span className="text-zinc-550 text-xs font-medium">Gagal memuat analisis risiko dari server ML.</span>
        </Card>
      )}

      {/* Academics & Financial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KRS Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Kartu Rencana Studi (KRS)</h2>
            <p className="text-xs text-zinc-500 mt-1">Daftar mata kuliah yang diambil berdasarkan riwayat semester di SIADIN.</p>
          </div>
          <KrsAccordion currentKrs={currentKrs} pastKrs={pastKrs} />
        </div>

        {/* Billing status */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Status Tagihan</h2>
            <p className="text-xs text-zinc-500 mt-1">Informasi status pembayaran registrasi semester Anda.</p>
          </div>
          {billing ? (
            <Card className="shadow-sm border border-zinc-200 bg-white">
              <CardHeader className="border-b border-zinc-150 p-5 bg-zinc-50/50">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      {billing.status.includes("TERBAYAR") ? "Detail Pembayaran" : "Detail Tagihan"}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500 mt-1 leading-snug">{billing.informasi}</CardDescription>
                  </div>
                  <Badge 
                    variant={billing.status.includes("TERBAYAR") ? "default" : "outline"} 
                    className={`text-[9px] uppercase px-1.5 py-0.5 border-zinc-300 ${billing.status.includes("TERBAYAR") ? "bg-zinc-900 text-zinc-50" : "text-zinc-650 bg-zinc-50"}`}
                  >
                    {billing.status.includes("TERBAYAR") ? "Lunas" : "Tagihan"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {billing.status.includes("TERBAYAR") ? "Jumlah Terbayar" : "Jumlah Pembayaran"}
                  </span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight block mt-1">{formatRupiah(billing.total_tagih)}</span>
                </div>

                <div className="border-t border-zinc-150 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tahun Ajaran</span>
                    <span className="font-medium text-zinc-800">{billing.tahun_ajaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status Pembayaran</span>
                    <span className="font-medium text-zinc-800">{billing.status_pembayaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Metode</span>
                    <span className="font-medium text-zinc-800">{billing.via || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tanggal</span>
                    <span className="font-mono text-zinc-650">{billing.tanggal ? billing.tanggal.split(' ')[0] : '-'}</span>
                  </div>
                </div>

                {!billing.status.includes("TERBAYAR") && (
                  <div className="border-t border-zinc-150 pt-4 space-y-2">
                    <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Rincian Tagihan</span>
                    <div className="space-y-1.5 text-[11px] font-mono">
                      {billing.SKS_sekarang && billing.SKS_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Biaya SKS</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.SKS_sekarang)}</span>
                        </div>
                      )}
                      {billing.SPP_sekarang && billing.SPP_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Biaya SPP</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.SPP_sekarang)}</span>
                        </div>
                      )}
                      {billing.GDG_sekarang && billing.GDG_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Biaya Gedung</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.GDG_sekarang)}</span>
                        </div>
                      )}
                      {billing.MOD_sekarang && billing.MOD_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Modul/Lainnya</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.MOD_sekarang)}</span>
                        </div>
                      )}
                      {billing.BK_sekarang && billing.BK_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Buku</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.BK_sekarang)}</span>
                        </div>
                      )}
                      {billing.POLI_sekarang && billing.POLI_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Poliklinik</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.POLI_sekarang)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border border-zinc-200 bg-white p-5 text-center">
              <span className="text-zinc-550 text-xs font-medium">Data tagihan tidak tersedia.</span>
            </Card>
          )}
        </div>
      </div>

      {/* Transcript Section */}
      <TranscriptView transcript={transcript} khsHeader={khsHeader} />
    </div>
  );
}
