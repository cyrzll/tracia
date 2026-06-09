import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { KrsAccordion } from "./KrsAccordion"
import { TranscriptView } from "./TranscriptView"

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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
        setErrorMsg(data.error || "Failed to load student data.");
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setErrorMsg("Network connection failed.");
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
        setEmailStatus({ type: 'success', msg: 'Email sent successfully to student!' });
        // Close modal after brief delay
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailSubject("");
          setEmailMessage("");
          setEmailStatus(null);
        }, 1800);
      } else {
        setEmailStatus({ type: 'error', msg: data.error || 'An error occurred while sending email.' });
      }
    } catch (err) {
      console.error(err);
      setEmailStatus({ type: 'error', msg: 'Failed to connect to email server.' });
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
        <h3 className="text-sm font-bold text-zinc-900">Failed to Load Data</h3>
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
        <h3 className="text-sm font-bold text-zinc-900">Select a Student</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">Please select a student from the list on the left to monitor their academic performance, risk anatomy visualization, KRS, and transcript.</p>
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
              Send Email
            </Button>
          </Card>
        </div>

        {/* Detail Profile Grid */}
        <div className="md:col-span-2">
          <Card className="shadow-sm border border-zinc-200 bg-white h-full">
            <CardHeader className="border-b border-zinc-150 p-4 bg-zinc-50/50">
              <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Selected Student Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Full Name</span>
                  <span className="text-xs font-semibold text-zinc-900 block mt-0.5">{student.nama}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Student ID (NIM)</span>
                  <span className="text-xs font-mono font-semibold text-zinc-900 block mt-0.5">{student.nim}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Campus Email</span>
                  <span className="text-xs font-mono text-zinc-900 block mt-0.5">{student.email}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Gender</span>
                  <span className="text-xs font-semibold text-zinc-900 block mt-0.5">
                    {student.gender === 'L' ? 'Male' : student.gender === 'P' ? 'Female' : student.gender}
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
              <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Academic Risk Analysis (AI Dropout Prediction)</CardTitle>
              <CardDescription className="text-[10px] text-zinc-500 mt-1 leading-snug">Visual student dropout vulnerability detection.</CardDescription>
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
              {student.risk_level === "Low" ? "Low" : student.risk_level === "Medium" ? "Medium" : "High"} Risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
            {/* Probability Circle/Display */}
            <div className="lg:col-span-1 text-center lg:border-r lg:border-zinc-200 lg:pr-6 flex flex-col justify-center items-center">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dropout Probability</span>
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
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Model Analysis Result</span>
                <p className="text-xs text-zinc-655 mt-1.5 leading-relaxed font-medium">
                  {student.risk_level === "Low" ? (
                    "The student's academic performance is in a safe condition with high stability. It is recommended to maintain credit and GPA achievement in the next semester."
                  ) : student.risk_level === "Medium" ? (
                    "The model detects indicators of medium-level dropout risk. It is recommended to review lecture attendance rates, GPA achievement trends, and ensure there are no late bill payments."
                  ) : (
                    "IMPORTANT: The model detects a high level of dropout risk. This is triggered by a significant downward trend in GPA, failed courses, late tuition payments, or low attendance rates. Schedule academic guidance with the Academic Advisor immediately."
                  )}
                </p>
              </div>

              <div className="border-t border-zinc-150 pt-3">
                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">AI Input Parameters</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono text-zinc-500">
                  <div>
                    <span className="text-zinc-400">Semester:</span>
                    <span className="font-bold text-zinc-800 ml-1">{student.semester}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Cumulative GPA:</span>
                    <span className="font-bold text-zinc-800 ml-1">{student.gpa.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Attendance (Ratio):</span>
                    <span className="font-bold text-zinc-800 ml-1">95.00%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Credit Velocity:</span>
                    <span className="font-bold text-zinc-800 ml-1">{velocity.toFixed(2)}/sem</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Failed Courses:</span>
                    <span className="font-bold text-zinc-800 ml-1">{transcript ? transcript.filter((c) => c.nl === 'D' || c.nl === 'E').length : 0}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Payment Status:</span>
                    <span className="font-bold text-zinc-800 ml-1">{billing && billing.status.includes("TERBAYAR") ? "Paid" : "Unpaid"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart Visualization */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center lg:border-l lg:border-zinc-200 lg:pl-6 py-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center w-full">Risk Anatomy Visualization</span>
              
              <div className="w-full h-full min-h-[180px] flex items-center justify-center">
                <Pie 
                  data={{
                    labels: ['Academic (GPA)', 'Financial', 'Credit Velocity', 'Attendance'],
                    datasets: [
                      {
                        data: [
                          isBrainHealthy ? 10 : 40, 
                          isHeartHealthy ? 10 : 30, 
                          isHandsHealthy ? 10 : 20, 
                          isFeetHealthy ? 10 : 10
                        ],
                        backgroundColor: [
                          isBrainHealthy ? 'rgba(212, 212, 216, 0.6)' : 'rgba(24, 24, 27, 0.95)',
                          isHeartHealthy ? 'rgba(228, 228, 231, 0.6)' : 'rgba(39, 39, 42, 0.9)',
                          isHandsHealthy ? 'rgba(244, 244, 245, 0.6)' : 'rgba(63, 63, 70, 0.85)',
                          isFeetHealthy ? 'rgba(250, 250, 250, 0.6)' : 'rgba(82, 82, 91, 0.8)',
                        ],
                        borderColor: [
                          '#e4e4e7',
                          '#e4e4e7',
                          '#e4e4e7',
                          '#e4e4e7',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        enabled: true,
                        bodyFont: {
                          size: 10
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 w-full text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isBrainHealthy ? 'bg-zinc-200' : 'bg-zinc-950'}`}></div>
                  <span className="text-zinc-500">GPA: {student.gpa.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isHeartHealthy ? 'bg-zinc-200' : 'bg-zinc-950'}`}></div>
                  <span className="text-zinc-500">Payment: {isHeartHealthy ? "Paid" : "Unpaid"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isHandsHealthy ? 'bg-zinc-200' : 'bg-zinc-950'}`}></div>
                  <span className="text-zinc-500">Credits: {student.sks}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isFeetHealthy ? 'bg-zinc-200' : 'bg-zinc-950'}`}></div>
                  <span className="text-zinc-500">Attendance: 95%</span>
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
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Study Plan (KRS)</h2>
          </div>
          <KrsAccordion currentKrs={currentKrs} pastKrs={pastKrs} />
        </div>

        {/* Billing status */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Finance & Billing</h2>
          </div>
          {billing ? (
            <Card className="shadow-sm border border-zinc-200 bg-white">
              <CardHeader className="border-b border-zinc-150 p-4 bg-zinc-50/50">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      {billing.status.includes("TERBAYAR") ? "Payment Details" : "Billing Details"}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500 mt-1 leading-snug">{billing.informasi}</CardDescription>
                  </div>
                  <Badge 
                    variant={billing.status.includes("TERBAYAR") ? "default" : "outline"} 
                    className={`text-[9px] uppercase px-1.5 py-0.5 border-zinc-300 ${billing.status.includes("TERBAYAR") ? "bg-zinc-900 text-zinc-50" : "text-zinc-650 bg-zinc-50"}`}
                  >
                    {billing.status.includes("TERBAYAR") ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                    {billing.status.includes("TERBAYAR") ? "Amount Paid" : "Payment Amount"}
                  </span>
                  <span className="text-lg font-black text-zinc-950 tracking-tight block mt-1">{formatRupiah(billing.total_tagih)}</span>
                </div>

                <div className="border-t border-zinc-150 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Academic Year</span>
                    <span className="font-medium text-zinc-800">{billing.tahun_ajaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status</span>
                    <span className="font-medium text-zinc-800">{billing.status_pembayaran === "LUNAS" ? "PAID" : billing.status_pembayaran === "UTS" ? "UNPAID" : billing.status_pembayaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Method</span>
                    <span className="font-medium text-zinc-800">{billing.via || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Date</span>
                    <span className="font-mono text-zinc-650">{billing.tanggal ? billing.tanggal.split(' ')[0] : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border border-zinc-200 bg-white p-5 text-center">
              <span className="text-zinc-550 text-xs font-medium">Billing data is not available.</span>
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
                <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Send Email to Student</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 mt-0.5 font-medium">Send notification or academic guidance using SMTP server.</CardDescription>
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
                  <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Sender (Admin)</label>
                  <input 
                    type="text" 
                    value={`${adminName} (${adminUsername})`}
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-500 focus:outline-none cursor-not-allowed font-medium" 
                  />
                </div>

                {/* Recipient info */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Recipient (Student)</label>
                  <input 
                    type="email" 
                    value={student.email}
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-500 focus:outline-none cursor-not-allowed font-mono font-medium" 
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="modal-email-subject" className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    id="modal-email-subject" 
                    required 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..." 
                    className="w-full text-xs px-3 py-2 border border-zinc-200 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="modal-email-message" className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Message / Content</label>
                  <textarea 
                    id="modal-email-message" 
                    required 
                    rows={5} 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write academic message here..." 
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
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSendingEmail}
                    className="px-4 py-2 bg-zinc-950 text-xs font-semibold text-white hover:bg-zinc-800 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-9"
                  >
                    {isSendingEmail ? (
                      <>
                        <span>Sending...</span>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      </>
                    ) : (
                      <span>Send Email</span>
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
