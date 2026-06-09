import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { KrsAccordion } from "./KrsAccordion"
import { TranscriptView } from "./TranscriptView"

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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
              <CardTitle className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Student Information</CardTitle>
              <CardDescription className="text-zinc-500">Details of student identity recorded in the SIADIN academic system.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Full Name</span>
                  <span className="text-xs font-semibold text-zinc-900 mt-1 block">{student.nama}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Student ID Number (NIM)</span>
                  <span className="text-xs font-mono font-semibold text-zinc-900 mt-1 block">{student.nim}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Campus Email</span>
                  <span className="text-xs font-mono text-zinc-900 mt-1 block">{student.email}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Gender</span>
                  <span className="text-xs font-semibold text-zinc-900 mt-1 block">
                    {student.gender === 'L' ? 'Male' : student.gender === 'P' ? 'Female' : student.gender}
                  </span>
                </div>
              </div>

              <div className="border border-zinc-200 bg-zinc-50/40 p-4 rounded text-xs leading-relaxed text-zinc-500">
                <span className="font-bold text-zinc-700 block mb-1">Student Access Notes</span>
                As a student, you have access to monitor your registration status and academic profile. For advanced dropout risk analysis, please contact your academic advisor or academic administration.
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
                <CardTitle className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Academic Risk Analysis (AI Dropout Prediction)</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 mt-1 leading-snug">Real-time student study failure risk prediction using XGBoost Machine Learning algorithm.</CardDescription>
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
                {prediction.risk_level === "Low" ? "Low" : prediction.risk_level === "Medium" ? "Medium" : "High"} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
              {/* Risk Percentage Display */}
              <div className="lg:col-span-1 text-center lg:border-r lg:border-zinc-200 lg:pr-6 flex flex-col justify-center items-center">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dropout Probability</span>
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
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Model Analysis Result</span>
                  <p className="text-xs text-zinc-655 mt-1.5 leading-relaxed font-medium">
                    {prediction.risk_level === "Low" ? (
                      "Your academic performance is in a safe condition with high stability. Maintain your Cumulative GPA and credit completion velocity in the next semester."
                    ) : prediction.risk_level === "Medium" ? (
                      "The model detects indicators of medium-level dropout risk. It is recommended to review lecture attendance rates, GPA achievement trends, and ensure there are no late bill payments."
                    ) : (
                      "IMPORTANT: The model detects a high level of dropout risk. This is triggered by a significant downward trend in GPA, failed courses, late tuition payments, or low attendance rates. Please contact your Academic Advisor immediately."
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
                      <span className="font-bold text-zinc-800 ml-1">{failedCourses}</span>
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
                      labels: ["Academic (GPA)", "Financial", "Credit Velocity", "Attendance"],
                      datasets: [
                        {
                          data: [
                            isBrainHealthy ? 10 : 40, 
                            isHeartHealthy ? 10 : 30, 
                            isHandsHealthy ? 10 : 20, 
                            isFeetHealthy ? 10 : 10
                          ],
                          backgroundColor: [
                            isBrainHealthy ? "rgba(212, 212, 216, 0.6)" : "rgba(24, 24, 27, 0.95)",
                            isHeartHealthy ? "rgba(228, 228, 231, 0.6)" : "rgba(39, 39, 42, 0.9)",
                            isHandsHealthy ? "rgba(244, 244, 245, 0.6)" : "rgba(63, 63, 70, 0.85)",
                            isFeetHealthy ? "rgba(250, 250, 250, 0.6)" : "rgba(82, 82, 91, 0.8)",
                          ],
                          borderColor: [
                            "#e4e4e7",
                            "#e4e4e7",
                            "#e4e4e7",
                            "#e4e4e7",
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
                    <div className={`w-2 h-2 rounded-full ${isBrainHealthy ? "bg-zinc-200" : "bg-zinc-950"}`}></div>
                    <span className="text-zinc-500">GPA: {student.gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isHeartHealthy ? "bg-zinc-200" : "bg-zinc-950"}`}></div>
                    <span className="text-zinc-500">Payment: {isHeartHealthy ? "Paid" : "Unpaid"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isHandsHealthy ? "bg-zinc-200" : "bg-zinc-950"}`}></div>
                    <span className="text-zinc-500">Credits: {khsHeader ? khsHeader.total_sks : 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isFeetHealthy ? "bg-zinc-200" : "bg-zinc-950"}`}></div>
                    <span className="text-zinc-500">Attendance: 95%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border border-zinc-200 bg-white p-5 text-center">
        </Card>
      )}

      {/* Academics & Financial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KRS Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <KrsAccordion currentKrs={currentKrs} pastKrs={pastKrs} />
        </div>

        {/* Billing status */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Billing Status</h2>
            <p className="text-xs text-zinc-500 mt-1">Information about your semester registration payment status.</p>
          </div>
          {billing ? (
            <Card className="shadow-sm border border-zinc-200 bg-white">
              <CardHeader className="border-b border-zinc-150 p-5 bg-zinc-50/50">
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
              <CardContent className="p-5 space-y-5">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {billing.status.includes("TERBAYAR") ? "Amount Paid" : "Payment Amount"}
                  </span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight block mt-1">{formatRupiah(billing.total_tagih)}</span>
                </div>

                <div className="border-t border-zinc-150 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Academic Year</span>
                    <span className="font-medium text-zinc-800">{billing.tahun_ajaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Payment Status</span>
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

                {!billing.status.includes("TERBAYAR") && (
                  <div className="border-t border-zinc-150 pt-4 space-y-2">
                    <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Billing Details</span>
                    <div className="space-y-1.5 text-[11px] font-mono">
                      {billing.SKS_sekarang && billing.SKS_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Credit Fee</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.SKS_sekarang)}</span>
                        </div>
                      )}
                      {billing.SPP_sekarang && billing.SPP_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Tuition Fee</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.SPP_sekarang)}</span>
                        </div>
                      )}
                      {billing.GDG_sekarang && billing.GDG_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Development Fee</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.GDG_sekarang)}</span>
                        </div>
                      )}
                      {billing.MOD_sekarang && billing.MOD_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Module/Others</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.MOD_sekarang)}</span>
                        </div>
                      )}
                      {billing.BK_sekarang && billing.BK_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Book</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(billing.BK_sekarang)}</span>
                        </div>
                      )}
                      {billing.POLI_sekarang && billing.POLI_sekarang > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>Polyclinic</span>
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
              <span className="text-zinc-550 text-xs font-medium">Billing data is not available.</span>
            </Card>
          )}
        </div>
      </div>

      {/* Transcript Section */}
      <TranscriptView transcript={transcript} khsHeader={khsHeader} />
    </div>
  );
}
