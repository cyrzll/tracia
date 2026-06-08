import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { KrsAccordion } from "./KrsAccordion"
import { TranscriptView } from "./TranscriptView"

import type { Student, Billing, SemesterKrs, CourseGrade, KhsHeader } from "@/types"

interface StudentDetailsPanelProps {
  initialStudent: Student | null;
  initialKrs: SemesterKrs | null;
  initialPastKrs: SemesterKrs[] | null;
  initialBilling: Billing | null;
  initialTranscript: CourseGrade[] | null;
  initialKhsHeader: KhsHeader | null;
  initialIsBrainHealthy: boolean;
  initialIsHeartHealthy: boolean;
  initialIsHandsHealthy: boolean;
  initialIsFeetHealthy: boolean;
  initialVelocity: number;
  adminName: string;
  adminUsername: string;
}

export function StudentDetailsPanel({
  initialStudent,
  initialKrs,
  initialPastKrs,
  initialBilling,
  initialTranscript,
  initialKhsHeader,
  initialIsBrainHealthy,
  initialIsHeartHealthy,
  initialIsHandsHealthy,
  initialIsFeetHealthy,
  initialVelocity,
  adminName,
  adminUsername
}: StudentDetailsPanelProps) {
  // State variables
  const [student, setStudent] = React.useState<Student | null>(initialStudent);
  const [currentKrs, setCurrentKrs] = React.useState(initialKrs);
  const [pastKrs, setPastKrs] = React.useState(initialPastKrs);
  const [billing, setBilling] = React.useState<Billing | null>(initialBilling);
  const [transcript, setTranscript] = React.useState(initialTranscript);
  const [khsHeader, setKhsHeader] = React.useState(initialKhsHeader);
  
  const [isBrainHealthy, setIsBrainHealthy] = React.useState(initialIsBrainHealthy);
  const [isHeartHealthy, setIsHeartHealthy] = React.useState(initialIsHeartHealthy);
  const [isHandsHealthy, setIsHandsHealthy] = React.useState(initialIsHandsHealthy);
  const [isFeetHealthy, setIsFeetHealthy] = React.useState(initialIsFeetHealthy);
  const [velocity, setVelocity] = React.useState(initialVelocity);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailMessage, setEmailMessage] = React.useState("");
  const [emailStatus, setEmailStatus] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  // Fetch Student details asynchronously
  const fetchDetails = async (nim: string, silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/student-details?nim=${encodeURIComponent(nim)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStudent(data.student);
        setCurrentKrs(data.currentKrsData);
        setPastKrs(data.pastKrsData);
        setBilling(data.billingData);
        setTranscript(data.transcriptData);
        setKhsHeader(data.khsHeaderData);
        setIsBrainHealthy(data.isBrainHealthy);
        setIsHeartHealthy(data.isHeartHealthy);
        setIsHandsHealthy(data.isHandsHealthy);
        setIsFeetHealthy(data.isFeetHealthy);
        setVelocity(data.velocity);
      } else if (!silent) {
        setErrorMsg(data.error || "Gagal memuat data mahasiswa.");
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setErrorMsg("Koneksi jaringan gagal.");
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  // Listen to custom student-selected event (CSR)
  React.useEffect(() => {
    const handleStudentSelected = (e: Event) => {
      const customEvent = e as CustomEvent<{ nim: string }>;
      if (customEvent.detail && customEvent.detail.nim) {
        fetchDetails(customEvent.detail.nim);
      }
    };

    window.addEventListener("student-selected" as any, handleStudentSelected);
    return () => {
      window.removeEventListener("student-selected" as any, handleStudentSelected);
    };
  }, []);

  // Polling for real-time updates
  React.useEffect(() => {
    if (!student?.nim) return;

    const interval = setInterval(() => {
      fetchDetails(student.nim, true);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [student?.nim]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle Send Email submission
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !emailSubject || !emailMessage) return;

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: student.email,
          subject: emailSubject,
          message: emailMessage
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailStatus({ type: 'success', msg: 'Email berhasil dikirim ke mahasiswa!' });
        // Close modal after brief delay
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailSubject("");
          setEmailMessage("");
          setEmailStatus(null);
        }, 1800);
      } else {
        setEmailStatus({ type: 'error', msg: data.error || 'Terjadi kesalahan saat mengirim email.' });
      }
    } catch (err) {
      console.error(err);
      setEmailStatus({ type: 'error', msg: 'Gagal menghubungkan ke server email.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (errorMsg) {
    return (
      <Card className="shadow-sm border border-zinc-200 bg-white p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-3">
          ⚠️
        </div>
        <h3 className="text-sm font-bold text-zinc-900">Gagal Memuat Data</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">{errorMsg}</p>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card className="shadow-sm border border-zinc-200 bg-white p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3 font-mono">
          🔍
        </div>
        <h3 className="text-sm font-bold text-zinc-900">Pilih Mahasiswa</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">Silakan pilih mahasiswa dari daftar di sebelah kiri untuk memantau performa akademis, visualisasi anatomi risiko, KRS, serta transkrip nilai mereka.</p>
      </Card>
    );
  }

  return (
    <div 
      className={`space-y-8 relative transition-all duration-500 transform ${
        isLoading 
          ? 'opacity-40 scale-[0.995] translate-y-1 pointer-events-none blur-[0.5px]' 
          : 'opacity-100 scale-100 translate-y-0 blur-0'
      }`}
    >
      
      {/* Loading Overlay spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-50/20 backdrop-blur-[1px]">
          <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Profile Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Foto Card */}
        <div className="md:col-span-1">
          <Card className="shadow-sm border border-zinc-200 bg-white p-5 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded border border-zinc-200 overflow-hidden bg-zinc-50 mb-3 relative shadow-inner">
              <img 
                src={student.foto} 
                alt={student.nama} 
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide leading-snug">{student.nama}</h2>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">{student.nim}</p>
            
            <Button
              id="btn-open-email-modal"
              onClick={() => {
                setEmailStatus(null);
                setEmailSubject("");
                setEmailMessage("");
                setIsEmailModalOpen(true);
              }}
              className="mt-4 w-full text-[11px] h-8 bg-zinc-950 text-zinc-50 hover:bg-zinc-800 transition-all font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              Kirim Email
            </Button>
          </Card>
        </div>

        {/* Detail Profile Grid */}
        <div className="md:col-span-2">
          <Card className="shadow-sm border border-zinc-200 bg-white h-full">
            <CardHeader className="border-b border-zinc-150 p-4 bg-zinc-50/50">
              <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Informasi Mahasiswa Terpilih</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Nama Lengkap</span>
                  <span className="text-xs font-semibold text-zinc-900 block mt-0.5">{student.nama}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">NIM</span>
                  <span className="text-xs font-mono font-semibold text-zinc-900 block mt-0.5">{student.nim}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Email Kampus</span>
                  <span className="text-xs font-mono text-zinc-900 block mt-0.5">{student.email}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Jenis Kelamin</span>
                  <span className="text-xs font-semibold text-zinc-900 block mt-0.5">
                    {student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : student.gender}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dropout Risk AI Prediction Card */}
      <Card className="shadow-sm border border-zinc-200 bg-white">
        <CardHeader className="border-b border-zinc-150 p-4 bg-zinc-50/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Analisis Risiko Akademik (AI Dropout Prediction)</CardTitle>
              <CardDescription className="text-[10px] text-zinc-500 mt-1 leading-snug">Deteksi tingkat kerawanan dropout mahasiswa secara visual.</CardDescription>
            </div>
            <Badge 
              className={`text-[9px] px-2 py-0.5 font-bold uppercase border-zinc-300 ${
                student.risk_level === "Low" 
                  ? "bg-zinc-50 text-zinc-800" 
                  : student.risk_level === "Medium"
                  ? "bg-zinc-850 text-zinc-50"
                  : "bg-zinc-950 text-zinc-50 border-2 border-black"
              }`}
            >
              Risiko {student.risk_level === "Low" ? "Rendah" : student.risk_level === "Medium" ? "Sedang" : "Tinggi"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
            {/* Probability Circle/Display */}
            <div className="lg:col-span-1 text-center lg:border-r lg:border-zinc-200 lg:pr-6 flex flex-col justify-center items-center">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Probabilitas Dropout</span>
              <span className="text-4xl font-black text-zinc-950 tracking-tighter block mt-2">{(student.risk_probability * 100).toFixed(2)}%</span>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mt-4 mx-auto max-w-[150px]">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    student.risk_level === "Low" 
                      ? "bg-zinc-400" 
                      : student.risk_level === "Medium" 
                      ? "bg-zinc-700" 
                      : "bg-zinc-950"
                  }`}
                  style={{ width: `${(student.risk_probability * 100)}%` }}
                />
              </div>
            </div>

            {/* AI Input Breakdown */}
            <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Hasil Analisis Model</span>
                <p className="text-xs text-zinc-655 mt-1.5 leading-relaxed font-medium">
                  {student.risk_level === "Low" ? (
                    "Performa akademik mahasiswa berada dalam kondisi aman dengan tingkat kestabilan tinggi. Disarankan untuk tetap mempertahankan pencapaian SKS dan IPK pada semester berikutnya."
                  ) : student.risk_level === "Medium" ? (
                    "Model mendeteksi adanya indikator risiko dropout tingkat menengah. Disarankan untuk meninjau kembali tingkat kehadiran kuliah, tren pencapaian IPK, serta memastikan tidak ada pembayaran tagihan yang terlambat."
                  ) : (
                    "PENTING: Model mendeteksi tingkat risiko dropout yang tinggi. Hal ini dipicu oleh tren penurunan IPK yang signifikan, adanya mata kuliah yang tidak lulus, keterlambatan pembayaran biaya kuliah, atau tingkat kehadiran yang rendah. Segera jadwalkan bimbingan akademik dengan Dosen Wali."
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
                    <span className="font-bold text-zinc-800 ml-1">{transcript ? transcript.filter((c) => c.nl === 'D' || c.nl === 'E').length : 0}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Status Bayar:</span>
                    <span className="font-bold text-zinc-800 ml-1">{billing && billing.status.includes("TERBAYAR") ? "Paid" : "Unpaid"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Anatomy Visualization */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center lg:border-l lg:border-zinc-200 lg:pl-6 py-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center w-full">Visualisasi Anatomi Risiko</span>
              
              <div className="flex items-center gap-4 w-full justify-between">
                <div className="relative flex-shrink-0">
                  <svg viewBox="0 0 120 220" className="w-16 h-auto text-zinc-900" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Head */}
                    <circle cx="60" cy="30" r="14" className="stroke-zinc-200" />
                    {/* Spine / Neck */}
                    <line x1="60" y1="44" x2="60" y2="60" className="stroke-zinc-200" />
                    {/* Torso */}
                    <path d="M 45 60 L 75 60 L 70 120 L 50 120 Z" className="stroke-zinc-200 fill-zinc-50/20" />
                    {/* Arms */}
                    <path d="M 43 60 C 30 80, 28 100, 32 120" className="stroke-zinc-200" />
                    <path d="M 77 60 C 90 80, 92 100, 88 120" className="stroke-zinc-200" />
                    {/* Legs */}
                    <path d="M 52 120 L 48 160 L 50 200" className="stroke-zinc-200" />
                    <path d="M 68 120 L 72 160 L 70 200" className="stroke-zinc-200" />
                    
                    {/* Brain Node */}
                    {isBrainHealthy ? (
                      <circle cx="60" cy="30" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                    ) : (
                      <g>
                        <circle cx="60" cy="30" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                        <circle cx="60" cy="30" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                      </g>
                    )}

                    {/* Heart Node */}
                    {isHeartHealthy ? (
                      <circle cx="60" cy="75" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                    ) : (
                      <g>
                        <circle cx="60" cy="75" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                        <circle cx="60" cy="75" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                      </g>
                    )}

                    {/* Hands Nodes */}
                    {isHandsHealthy ? (
                      <>
                        <circle cx="32" cy="120" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                        <circle cx="88" cy="120" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                      </>
                    ) : (
                      <g>
                        <circle cx="32" cy="120" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                        <circle cx="32" cy="120" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                        
                        <circle cx="88" cy="120" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                        <circle cx="88" cy="120" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                      </g>
                    )}

                    {/* Feet Nodes */}
                    {isFeetHealthy ? (
                      <>
                        <circle cx="50" cy="200" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                        <circle cx="70" cy="200" r="4.5" className="fill-zinc-100 stroke-zinc-400" strokeWidth="1.5" />
                      </>
                    ) : (
                      <g>
                        <circle cx="50" cy="200" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                        <circle cx="50" cy="200" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                        
                        <circle cx="70" cy="200" r="7.5" className="fill-zinc-950/15 stroke-zinc-950/25 animate-pulse" strokeWidth="1" />
                        <circle cx="70" cy="200" r="3.5" className="fill-zinc-950 stroke-zinc-950" strokeWidth="1" />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Mini bullet indicators */}
                <div className="flex-1 space-y-3 text-[10px] leading-snug">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      🧠 Otak (GPA)
                      <span className={`w-1.5 h-1.5 rounded-full ${isBrainHealthy ? 'bg-zinc-455' : 'bg-zinc-950 animate-pulse'}`}></span>
                    </span>
                    <span className="text-zinc-550 font-mono pl-4">{student.gpa.toFixed(2)} IPK</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      ❤️ Jantung (Bayar)
                      <span className={`w-1.5 h-1.5 rounded-full ${isHeartHealthy ? 'bg-zinc-455' : 'bg-zinc-950 animate-pulse'}`}></span>
                    </span>
                    <span className="text-zinc-550 pl-4">{isHeartHealthy ? "Lunas" : "Tunggakan"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      💪 Tangan (SKS)
                      <span className={`w-1.5 h-1.5 rounded-full ${isHandsHealthy ? 'bg-zinc-455' : 'bg-zinc-950 animate-pulse'}`}></span>
                    </span>
                    <span className="text-zinc-550 pl-4">{student.sks} SKS ({transcript ? transcript.filter((c) => c.nl === 'D' || c.nl === 'E').length : 0} MK Gagal)</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      👣 Kaki (Hadir)
                      <span className={`w-1.5 h-1.5 rounded-full ${isFeetHealthy ? 'bg-zinc-455' : 'bg-zinc-950 animate-pulse'}`}></span>
                    </span>
                    <span className="text-zinc-550 font-mono pl-4">95% ({velocity.toFixed(1)}/sem)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academics & Financial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KRS Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Rencana Studi (KRS)</h2>
          </div>
          <KrsAccordion currentKrs={currentKrs} pastKrs={pastKrs} />
        </div>

        {/* Billing status */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Keuangan & Tagihan</h2>
          </div>
          {billing ? (
            <Card className="shadow-sm border border-zinc-200 bg-white">
              <CardHeader className="border-b border-zinc-150 p-4 bg-zinc-50/50">
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
              <CardContent className="p-4 space-y-4">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                    {billing.status.includes("TERBAYAR") ? "Jumlah Terbayar" : "Jumlah Pembayaran"}
                  </span>
                  <span className="text-lg font-black text-zinc-950 tracking-tight block mt-1">{formatRupiah(billing.total_tagih)}</span>
                </div>

                <div className="border-t border-zinc-150 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tahun Ajaran</span>
                    <span className="font-medium text-zinc-800">{billing.tahun_ajaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status</span>
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
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border border-zinc-200 bg-white p-5 text-center">
              <span className="text-zinc-550 text-xs font-medium">Data tagihan tidak tersedia.</span>
            </Card>
          )}
        </div>
      </div>

      {/* Transcript Listing component */}
      <TranscriptView transcript={transcript} khsHeader={khsHeader} />

      {/* Email Modal Dialog Portal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm transition-all duration-300">
          <Card className="relative w-full max-w-lg overflow-hidden border border-zinc-200 bg-white shadow-2xl rounded-xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="px-6 py-4 bg-zinc-50 border-b border-zinc-150 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Kirim Email ke Mahasiswa</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 mt-0.5 font-medium">Kirim notifikasi atau bimbingan akademik menggunakan SMTP server.</CardDescription>
              </div>
              <button 
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSendEmail} className="space-y-4">
                {/* Sender info */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Pengirim (Admin)</label>
                  <input 
                    type="text" 
                    value={`${adminName} (${adminUsername})`}
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-500 focus:outline-none cursor-not-allowed font-medium" 
                  />
                </div>

                {/* Recipient info */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Penerima (Mahasiswa)</label>
                  <input 
                    type="email" 
                    value={student.email}
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-500 focus:outline-none cursor-not-allowed font-mono font-medium" 
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="modal-email-subject" className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Subjek Email</label>
                  <input 
                    type="text" 
                    id="modal-email-subject" 
                    required 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Masukkan subjek email..." 
                    className="w-full text-xs px-3 py-2 border border-zinc-200 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="modal-email-message" className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Pesan / Konten</label>
                  <textarea 
                    id="modal-email-message" 
                    required 
                    rows={5} 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Tulis pesan akademik di sini..." 
                    className="w-full text-xs px-3 py-2 border border-zinc-200 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all resize-none font-medium"
                  ></textarea>
                </div>

                {/* Status message */}
                {emailStatus && (
                  <div className={`text-[11px] p-2.5 rounded border font-medium ${
                    emailStatus.type === 'success' ? 'border-zinc-200 bg-zinc-50 text-zinc-900 font-semibold' : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {emailStatus.msg}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2 border border-zinc-250 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 rounded transition-all cursor-pointer h-9"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSendingEmail}
                    className="px-4 py-2 bg-zinc-950 text-xs font-semibold text-white hover:bg-zinc-800 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-9"
                  >
                    {isSendingEmail ? (
                      <>
                        <span>Mengirim...</span>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      </>
                    ) : (
                      <span>Kirim Email</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
