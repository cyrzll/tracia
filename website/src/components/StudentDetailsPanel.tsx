import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, AlertTriangle, MessageSquare, TrendingUp, BarChart2, Shield, 
  Sparkles, RefreshCw, Send, CheckCircle2, Trash, UserPlus, Database,
  Cpu, Settings, Mail, ShieldAlert, Award, FileText, ChevronRight, Activity,
  Edit
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { KrsAccordion } from "./KrsAccordion"
import { TranscriptView } from "./TranscriptView"

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Pie, Line, Bar, Scatter } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

import type { Student, Billing, SemesterKrs, CourseGrade, KhsHeader } from "@/types"
import { getTranslation, type LangCode } from "../utils/lang"

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
  adminLevel?: string;
  students?: Student[];
}

// Safe LocalStorage hook
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (val: T) => void] => {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setState(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [state, setValue];
};

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
  adminUsername,
  adminLevel = "admin",
  students = []
}: StudentDetailsPanelProps) {
  const [lang, setLang] = React.useState<LangCode>('en');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: LangCode }>;
      if (customEvent.detail?.lang) {
        setLang(customEvent.detail.lang);
      }
    };
    window.addEventListener('tracia-lang-changed', handleLangChange);
    const saved = window.localStorage.getItem('tracia_lang') as LangCode;
    if (saved) setLang(saved);
    return () => window.removeEventListener('tracia-lang-changed', handleLangChange);
  }, []);

  const t = getTranslation(lang);

  // Tab selections
  const [lecturerTab, setLecturerTab] = React.useState("at-risk");
  const [adminTab, setAdminTab] = React.useState(() => 
    initialStudent ? 'student-details' : 'insights'
  );

  // State
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

  // Intervention log forms
  const [interventions, setInterventions] = useLocalStorage<Array<{
    id: string; nim: string; nama: string; type: string; notes: string; date: string; status: string; followUp: string;
  }>>("tracia_interventions", [
    { id: "int-1", nim: "A11.2023.15001", nama: "Gideon Widyanto", type: "Billing Alert", notes: "Called student about outstanding fee payments.", date: "2026-06-10", status: "In Progress", followUp: "2026-06-20" },
    { id: "int-2", nim: "A11.2023.15004", nama: "Farhan Hakim", type: "Academic Consultation", notes: "Reviewed course velocity drop, set study checkpoints.", date: "2026-06-02", status: "Resolved", followUp: "2026-06-16" }
  ]);
  const [newIntType, setNewIntType] = React.useState("Academic Consultation");
  const [newIntNotes, setNewIntNotes] = React.useState("");
  const [newIntFollowUp, setNewIntFollowUp] = React.useState("");

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailMessage, setEmailMessage] = React.useState("");
  const [emailStatus, setEmailStatus] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  // User Management lists
  const [users, setUsers] = React.useState<Array<{ username: string; name: string; email: string; level: string }>>([]);
  const [newUserRole, setNewUserRole] = React.useState("lecturer-F11");
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserUsername, setNewUserUsername] = React.useState("");
  const [newUserPassword, setNewUserPassword] = React.useState("");
  const [userSuccessMsg, setUserSuccessMsg] = React.useState<string | null>(null);
  const [userErrorMsg, setUserErrorMsg] = React.useState<string | null>(null);
  const [editingUser, setEditingUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (adminLevel !== 'admin') return;
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (res.ok && data.success) {
          setUsers(data.users);
        }
      } catch (e) {
        console.error("Failed to load database users:", e);
      }
    };
    loadUsers();
  }, [adminLevel]);

  // AI model retraining state
  const [isRetraining, setIsRetraining] = React.useState(false);
  const [retrainLogs, setRetrainLogs] = React.useState<string[]>([]);
  const [modelMetrics, setModelMetrics] = React.useState({
    accuracy: 94.20,
    f1Score: 92.50,
    version: "XGBoost v2.1.2",
    lastTrained: "2026-06-15 03:00:00"
  });

  // System alerts
  const [alerts, setAlerts] = useLocalStorage<Array<{ id: string; msg: string; severity: 'critical' | 'warning' | 'info'; time: string }>>(
    "tracia_alerts",
    [
      { id: "alt-1", msg: "Critical Drop in GPA average for Informatics class 2B", severity: "critical", time: "10 mins ago" },
      { id: "alt-2", msg: "Outstanding payments above limits for 5 students", severity: "warning", time: "1 hour ago" },
      { id: "alt-3", msg: "Model performance metrics logged: data drift negligible", severity: "info", time: "2 hours ago" }
    ]
  );

  // Sync details from events
  const fetchDetails = async (nim: string, silent = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) setErrorMsg("Network connection failed.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const handleStudentSelected = (e: Event) => {
      const customEvent = e as CustomEvent<{ nim: string }>;
      if (customEvent.detail && customEvent.detail.nim) {
        if (adminLevel === 'admin') {
          setAdminTab('student-details');
        }
        setLecturerTab('at-risk');
        fetchDetails(customEvent.detail.nim);
      }
    };
    window.addEventListener("student-selected" as any, handleStudentSelected);
    return () => {
      window.removeEventListener("student-selected" as any, handleStudentSelected);
    };
  }, [adminLevel]);

  // Email sending function
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !emailSubject || !emailMessage) return;
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: student.email, subject: emailSubject, message: emailMessage })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus({ type: 'success', msg: 'Email sent successfully to student!' });
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailSubject("");
          setEmailMessage("");
          setEmailStatus(null);
        }, 1500);
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

  // Intervention log submit
  const handleAddIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newIntNotes) return;
    const newLog = {
      id: "int-" + Math.random().toString(36).substring(2, 9),
      nim: student.nim,
      nama: student.nama,
      type: newIntType,
      notes: newIntNotes,
      date: new Date().toISOString().split('T')[0],
      status: "In Progress",
      followUp: newIntFollowUp || "-"
    };
    setInterventions([newLog, ...interventions]);
    setNewIntNotes("");
    setNewIntFollowUp("");
  };

  // Add User submit
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessMsg(null);
    setUserErrorMsg(null);
    if (!newUserUsername || !newUserName || !newUserEmail || !newUserRole) return;

    try {
      if (editingUser) {
        // Edit User Mode
        const res = await fetch('/api/update-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalUsername: editingUser,
            username: newUserUsername,
            name: newUserName,
            email: newUserEmail,
            level: newUserRole,
            password: newUserPassword || undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUsers(users.map(u => u.username === editingUser ? {
            username: newUserUsername,
            name: newUserName,
            email: newUserEmail,
            level: newUserRole
          } : u));
          setUserSuccessMsg("User details updated successfully!");
          setEditingUser(null);
          setNewUserName("");
          setNewUserEmail("");
          setNewUserUsername("");
          setNewUserPassword("");
          setNewUserRole("lecturer-F11");
        } else {
          setUserErrorMsg(data.error || "Failed to update user.");
        }
      } else {
        // Register User Mode
        const res = await fetch('/api/register-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: newUserUsername,
            name: newUserName,
            email: newUserEmail,
            level: newUserRole,
            password: newUserPassword || undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUsers([...users, {
            username: newUserUsername,
            name: newUserName,
            email: newUserEmail,
            level: newUserRole
          }]);
          setUserSuccessMsg(`User registered successfully! Password: ${data.defaultPassword}`);
          setNewUserName("");
          setNewUserEmail("");
          setNewUserUsername("");
          setNewUserPassword("");
          setNewUserRole("lecturer-F11");
        } else {
          setUserErrorMsg(data.error || "Failed to register user.");
        }
      }
    } catch (err) {
      console.error(err);
      setUserErrorMsg("Network error: failed to connect to database API.");
    }
  };

  const handleStartEditUser = (u: { username: string; name: string; email: string; level: string }) => {
    setEditingUser(u.username);
    setNewUserName(u.name);
    setNewUserEmail(u.email);
    setNewUserRole(u.level);
    setNewUserUsername(u.username);
    setNewUserPassword("");
    setUserSuccessMsg(null);
    setUserErrorMsg(null);
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserUsername("");
    setNewUserPassword("");
    setNewUserRole("lecturer-F11");
    setUserSuccessMsg(null);
    setUserErrorMsg(null);
  };

  // Delete User from DB
  const handleDeleteUser = async (username: string) => {
    setUserSuccessMsg(null);
    setUserErrorMsg(null);
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(users.filter(u => u.username !== username));
        setUserSuccessMsg("User deleted successfully.");
      } else {
        setUserErrorMsg(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error(err);
      setUserErrorMsg("Network error: failed to delete user.");
    }
  };

  const getRoleLabel = (level: string) => {
    if (level === 'admin') return 'Super Admin';
    if (level === 'student') return 'Student';
    if (level.startsWith('lecturer-')) {
      const prodi = level.split('-')[1];
      if (prodi === 'F11') return 'Kaprodi TI (F11)';
      if (prodi === 'F12') return 'Kaprodi SI (F12)';
      if (prodi === 'F13') return 'Kaprodi Manajemen (F13)';
      if (prodi === 'F14') return 'Kaprodi DKV (F14)';
      return `Lecturer (${prodi})`;
    }
    return level;
  };

  // Model Retraining Simulation
  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainLogs(["[INFO] Initiating Model Training Pipeline...", "[INFO] Loading training dataset...", "[INFO] Preprocessing features..."]);
    setTimeout(() => {
      setRetrainLogs(prev => [...prev, "[INFO] Tuning hyper-parameters via Optuna...", "[INFO] Optimal Parameters: max_depth=6, eta=0.1, n_estimators=100"]);
    }, 1000);
    setTimeout(() => {
      setRetrainLogs(prev => [...prev, "[INFO] Training final XGBoost Classifier...", "[INFO] Calculating SHAP explainer matrix...", "[SUCCESS] Exporting model artifact 'tracia_xgboost.json'"]);
      setIsRetraining(false);
      setModelMetrics({
        accuracy: 95.80,
        f1Score: 94.10,
        version: "XGBoost v2.2.0-opt",
        lastTrained: new Date().toLocaleString()
      });
    }, 3000);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Quadrant Scatter Coordinates (Real data from database)
  const triageData = React.useMemo(() => {
    const list = students && students.length > 0 ? students : [
      { nim: "A11.2023.15001", nama: "Gideon Widyanto", gpa: 2.45, risk_level: "Medium" },
      { nim: "A11.2023.15002", nama: "Aulia Rahma", gpa: 3.82, risk_level: "Low" },
      { nim: "A11.2023.15003", nama: "David Alfarizi", gpa: 3.51, risk_level: "Low" },
      { nim: "A11.2023.15004", nama: "Farhan Hakim", gpa: 2.10, risk_level: "High" },
      { nim: "A11.2023.15005", nama: "Siti Rahma", gpa: 3.12, risk_level: "Medium" }
    ] as any[];

    return list.map(s => {
      const charSum = s.nim.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      let baseEngagement = 85;
      if (s.risk_level === 'High') {
        baseEngagement = 50;
      } else if (s.risk_level === 'Medium') {
        baseEngagement = 70;
      }
      const engagement = baseEngagement + (charSum % 15);
      return {
        x: s.gpa,
        y: engagement,
        label: s.nama,
        gpa: s.gpa,
        nim: s.nim,
        risk: s.risk_level
      };
    });
  }, [students]);

  const renderLecturerView = () => {
    // Calibrate Risk Anatomy Breakdown & Dynamic Explanation
    const gpaRisk = student ? Math.max(5, Math.round((4.0 - student.gpa) * 20)) : 5;
    const financialRisk = !isHeartHealthy ? 40 : 5;
    const creditsRisk = student ? Math.max(5, Math.round(Math.max(0, 18 - velocity) * 3)) + (!isHandsHealthy ? 15 : 0) : 5;
    const attendanceRisk = 5;

    const getModelExplanation = () => {
      if (!student) return "";
      if (student.risk_level === 'Low') {
        return "No immediate actions required. Student maintains metrics above standard thresholds. Keep monitoring credit speed velocities.";
      }

      const triggers: string[] = [];
      const recommendations: string[] = [];

      if (!isBrainHealthy) {
        triggers.push(`lower cumulative GPA (${student.gpa.toFixed(2)})`);
        recommendations.push("academic tutoring and GPA recovery planning");
      }

      if (!isHeartHealthy) {
        triggers.push("unpaid semester tuition billing");
        recommendations.push("coordinating with the financial department for payment installment options");
      }

      if (!isFeetHealthy) {
        triggers.push(`lower credit accumulation velocity (${velocity.toFixed(2)} SKS/semester)`);
        recommendations.push("advising the student to optimize course load and credit planning");
      }

      if (!isHandsHealthy) {
        const failedCount = transcript ? transcript.filter(c => c.nl === 'D' || c.nl === 'E').length : 0;
        triggers.push(failedCount > 0 ? `presence of failed courses (${failedCount} with D/E grades)` : "presence of failed courses");
        recommendations.push("prioritizing retaking failed courses to recover GPA");
      }

      if (triggers.length > 0) {
        const triggerText = triggers.join(" and ");
        const recText = recommendations.join(", and ");
        return `Intervention recommended. Risk factors detected: ${triggerText}. Recommended action: ${recText.charAt(0).toUpperCase() + recText.slice(1)}.`;
      } else {
        return `Student's core academic and financial metrics are currently in excellent standing. The ${student.risk_level.toLowerCase()} risk classification may reflect baseline transition statistics or early-semester enrollment patterns (Semester ${student.semester}). Recommended action: normal monitoring and a routine check-in with the faculty advisor to maintain momentum.`;
      }
    };

    return (
        <div className="space-y-6">
          {!student ? (
            <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-8 rounded-2xl text-center text-zinc-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-zinc-650" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Student Selected</h3>
              <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Select a student from the Watchlist on the left to inspect their real-time dropout risk profile, academic performance, and study health metrics.
              </p>
            </Card>
          ) : (
            <>
              {/* Sub Navigation */}
              <div className="flex gap-2 w-full overflow-x-auto border-b border-zinc-900 pb-3" data-lenis-prevent>
                {[
                  { id: "at-risk", label: t.watchlist, icon: Users },
                  { id: "triage", label: t.triageMatrix, icon: Activity },
                  { id: "burnout", label: t.burnoutRadar, icon: AlertTriangle },
                  { id: "interventions", label: t.interventionLog, icon: MessageSquare },
                  { id: "reports", label: t.classReports, icon: BarChart2 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setLecturerTab(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        lecturerTab === tab.id 
                          ? "bg-zinc-800 text-white border border-zinc-700/60" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

          <AnimatePresence mode="wait">
            
            {/* SUB-TAB: AT-RISK ANALYSIS & STUDENT DETAILS */}
            {lecturerTab === "at-risk" && (
              <motion.div
                key="at-risk"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Active Student identity banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Avatar/Details card */}
                  <Card className="md:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 flex flex-col items-center text-center rounded-2xl text-white">
                    <div className="w-20 h-20 rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900 mb-3">
                      <img src={student.foto} alt={student.nama} className="w-full h-full object-cover grayscale" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wide leading-snug">{student.nama}</h3>
                    <p className="text-[10px] text-zinc-550 font-mono mt-0.5">{student.nim}</p>

                    <Button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="mt-4 w-full text-[10px] h-8 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Send Email Notice
                    </Button>
                  </Card>

                  {/* Identity detail grid */}
                  <Card className="md:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl text-white">
                    <CardHeader className="p-0 pb-3 border-b border-zinc-900">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Student Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4 space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Major Pathway</span>
                          <span className="text-white block mt-0.5 font-semibold">Informatics Engineering</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Cumulative GPA</span>
                          <span className="text-white block mt-0.5 font-semibold">{student.gpa.toFixed(2)} / 4.00</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Credits Completed</span>
                          <span className="text-white block mt-0.5 font-semibold font-mono">{student.sks} SKS</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Attendance Rate</span>
                          <span className="text-white block mt-0.5 font-semibold font-mono">95.00%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Dropout vulnerability prediction details */}
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">AI Student Dropout Predictor Model Details</CardTitle>
                    </div>
                    <Badge className={`text-[8px] uppercase tracking-wider font-bold ${
                      student.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      student.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {student.risk_level} Risk Profile
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 text-center lg:border-r lg:border-zinc-800/80 lg:pr-6 flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dropout probability</span>
                      <span className="text-3xl font-black text-white mt-2 block">{(student.risk_probability * 100).toFixed(2)}%</span>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-4">
                        <div className={`h-full ${
                          student.risk_level === 'Low' ? 'bg-emerald-500' : student.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                        }`} style={{ width: `${student.risk_probability * 100}%` }} />
                      </div>
                    </div>

                    {/* AI Parameters */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <span className="block text-[10px] font-bold text-white uppercase tracking-widest">Model Explanation & Advice</span>
                        <p className="text-xs text-white leading-relaxed mt-2 font-medium">
                          {getModelExplanation()}
                        </p>
                      </div>

                      <div className="border-t border-zinc-900 pt-3">
                        <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Algorithm Parameters Analyzed</span>
                        <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-zinc-400">
                          <div>Semester: <span className="text-white font-bold">{student.semester}</span></div>
                          <div>GPA: <span className="text-white font-bold">{student.gpa}</span></div>
                          <div>Velocity: <span className="text-white font-bold">{velocity.toFixed(2)}</span></div>
                          <div>Billing Status: <span className="text-white font-bold">{billing && billing.status.includes("TERBAYAR") ? "Paid" : "Unpaid"}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Chart preview */}
                    <div className="lg:col-span-1 flex flex-col items-center justify-center">
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 text-center">Risk Anatomy breakdown</span>
                      <div className="w-24 h-24">
                        <Pie 
                          data={{
                            labels: ['GPA', 'Financial', 'Credits', 'Attendance'],
                            datasets: [{
                              data: [gpaRisk, financialRisk, creditsRisk, attendanceRisk],
                              backgroundColor: ['#818cf8', '#f472b6', '#38bdf8', '#34d399'],
                              borderColor: '#000', borderWidth: 1
                            }]
                          }}
                          options={{ plugins: { legend: { display: false } } }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Academic docs (KRS & Transcript) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <KrsAccordion currentKrs={currentKrs} pastKrs={pastKrs} />
                  </div>
                  <div className="lg:col-span-1">
                    <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl text-white">
                      <CardHeader className="p-0 pb-3 border-b border-zinc-900">
                        <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Billing Status</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 pt-4 space-y-4">
                        {billing ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-400">Semester Payment</span>
                              <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase text-[9px]">{billing.status}</Badge>
                            </div>
                            <div className="text-lg font-black font-mono text-white">{formatRupiah(billing.total_tagih)}</div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">{billing.informasi}</p>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-xs font-semibold">No active billing records.</span>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <TranscriptView transcript={transcript} khsHeader={khsHeader} />

              </motion.div>
            )}

            {/* SUB-TAB: TRIAGE MATRIX */}
            {lecturerTab === "triage" && (
              <motion.div
                key="triage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Interactive Triage Matrix</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Quadrant analysis mapping Academic Performance vs. Engagement.</CardDescription>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scatter plot chart */}
                    <div className="lg:col-span-2 h-80 bg-zinc-950/30 p-4 rounded-xl border border-zinc-900">
                      <Scatter 
                        data={{
                          datasets: [
                            {
                              label: "Student Profile Positions",
                              data: triageData,
                              backgroundColor: triageData.map(d => 
                                d.risk === 'High' ? '#f87171' : d.risk === 'Medium' ? '#fbbf24' : '#34d399'
                              ),
                              pointRadius: 8,
                              pointHoverRadius: 10
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          onClick: (event: any, elements: any[]) => {
                            if (elements && elements.length > 0) {
                              const index = elements[0].index;
                              const item = triageData[index];
                              if (item && item.nim) {
                                window.dispatchEvent(new CustomEvent('student-selected', { detail: { nim: item.nim } }));
                                const url = new URL(window.location.href);
                                url.searchParams.set('nim', item.nim);
                                window.history.pushState(null, '', url.toString());
                              }
                            }
                          },
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: (ctx: any) => {
                                  const raw = ctx.raw;
                                  return `${raw.label} (GPA: ${raw.gpa}, Engagement: ${raw.y}%)`;
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: { display: true, text: "Academic Performance (GPA)", color: "#a1a1aa", font: { size: 10 } },
                              min: 0, max: 4.0,
                              grid: { color: "#18181b" },
                              ticks: { color: "#71717a" }
                            },
                            y: {
                              title: { display: true, text: "Engagement Level (Attendance %)", color: "#a1a1aa", font: { size: 10 } },
                              min: 40, max: 100,
                              grid: { color: "#18181b" },
                              ticks: { color: "#71717a" }
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Explainer / Selector box */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="p-4 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
                        <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Quadrant Explanations</span>
                        <div className="space-y-2 text-[10px] leading-relaxed text-zinc-400">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
                            <span><strong>Bottom Left (Critical):</strong> Low GPA & low class attendance. Requires immediate phone reachout.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                            <span><strong>Top Left (Support):</strong> Low GPA but high attendance. Needs tutoring support.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
                            <span><strong>Top Right (Succeeding):</strong> Safe academic conditions.</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-zinc-900 bg-zinc-950/30 rounded-xl">
                        <span className="font-bold text-white uppercase tracking-wider text-[10px] block">AI Suggested Interventions</span>
                        <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                          For students falling in the red critical zone, the model automatically schedules financial assistance checks and registers academic advisor consult parameters.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SUB-TAB: BURNOUT RADAR */}
            {lecturerTab === "burnout" && (
              <motion.div
                key="burnout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Distribution Bar Chart */}
                  <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                    <div className="border-b border-zinc-900 pb-3 mb-4">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Burnout & Stress Distribution Radar</CardTitle>
                      <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Estimated student burnout probability metrics based on course workload and GPA changes.</CardDescription>
                    </div>

                    <div className="h-64 w-full">
                      <Bar 
                        data={{
                          labels: ["Informatics", "Computer Science", "Information Systems", "Software Eng", "Data Science"],
                          datasets: [
                            {
                              label: "High Stress Count",
                              data: [4, 6, 2, 8, 3],
                              backgroundColor: "rgba(244, 63, 94, 0.75)",
                              borderColor: "rgb(244, 63, 94)",
                              borderWidth: 1
                            },
                            {
                              label: "Moderate Stress Count",
                              data: [12, 10, 15, 8, 9],
                              backgroundColor: "rgba(245, 158, 11, 0.75)",
                              borderColor: "rgb(245, 158, 11)",
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { labels: { color: "#a1a1aa", font: { size: 9 } } } },
                          scales: {
                            x: { grid: { display: false }, ticks: { color: "#71717a", font: { size: 9 } } },
                            y: { grid: { color: "#18181b" }, ticks: { color: "#71717a", font: { size: 9 } } }
                          }
                        }}
                      />
                    </div>
                  </Card>

                  {/* Stress drivers breakdown */}
                  <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="border-b border-zinc-900 pb-3 mb-4">
                        <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Stress Drivers Analysis</CardTitle>
                      </div>

                      <div className="space-y-4 text-xs font-sans">
                        {[
                          { label: "Academic Workload Pressure", value: 45, color: "bg-red-500" },
                          { label: "Financial / Tuition Anxiety", value: 30, color: "bg-amber-500" },
                          { label: "Extracurricular Commitments", value: 15, color: "bg-indigo-500" },
                          { label: "Personal Wellness Issues", value: 10, color: "bg-emerald-500" }
                        ].map((driver, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-400 font-semibold">{driver.label}</span>
                              <span className="text-white font-bold">{driver.value}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                              <div className={`${driver.color} h-full`} style={{ width: `${driver.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-zinc-900 pt-4 text-[10px] text-zinc-550 leading-relaxed">
                      <span className="font-bold text-white block">Burnout Intervention recommendation</span>
                      Consider reducing max SKS approval loads for students displaying over 80% stress drivers.
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB: INTERVENTION LOGGING */}
            {lecturerTab === "interventions" && (
              <motion.div
                key="interventions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Form to log intervention */}
                <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Log New Consultation</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Register advisor intervention actions for the selected student.</CardDescription>
                  </div>

                  <form onSubmit={handleAddIntervention} className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Target Student</label>
                      <input 
                        type="text" 
                        value={`${student.nama} (${student.nim})`} 
                        disabled 
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Intervention Type</label>
                      <select 
                        value={newIntType} 
                        onChange={(e) => setNewIntType(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option>Academic Consultation</option>
                        <option>Billing Alert</option>
                        <option>Tutoring Scheduler</option>
                        <option>Personal Counseling</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Consultation Summary Notes</label>
                      <textarea 
                        required 
                        rows={4}
                        value={newIntNotes}
                        onChange={(e) => setNewIntNotes(e.target.value)}
                        placeholder="Detail the consultation highlights..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Follow-up Target Date</label>
                      <input 
                        type="date" 
                        value={newIntFollowUp}
                        onChange={(e) => setNewIntFollowUp(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-9 text-xs cursor-pointer">
                      Log Active Intervention
                    </Button>
                  </form>
                </Card>

                {/* Intervention History Database */}
                <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl overflow-hidden">
                  <div className="border-b border-zinc-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Active Interventions History</CardTitle>
                      <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Logs of outreach attempts in current semester.</CardDescription>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1" data-lenis-prevent>
                    {interventions.map((log) => (
                      <div key={log.id} className="p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-white block">{log.nama}</span>
                            <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">{log.nim}</span>
                          </div>
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] uppercase font-bold">{log.type}</Badge>
                        </div>
                        <p className="text-zinc-350 leading-relaxed font-medium">{log.notes}</p>
                        <div className="border-t border-zinc-900 pt-2 flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Logged: {log.date}</span>
                          <span>Follow-up: <strong className="text-indigo-400">{log.followUp}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

              </motion.div>
            )}

            {/* SUB-TAB: CLASS REPORTS */}
            {lecturerTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Reports summary and class statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl text-white">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Class Average GPA</span>
                    <span className="text-3xl font-black font-mono text-white mt-2 block">3.18 / 4.00</span>
                    <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider mt-1 block">▲ 0.05 vs Last Sem</span>
                  </Card>
                  
                  <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl text-white">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Failed Courses Rate</span>
                    <span className="text-3xl font-black font-mono text-white mt-2 block">2.4%</span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 block">Within safety margins</span>
                  </Card>

                  <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl text-white">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Intervention Success Rate</span>
                    <span className="text-3xl font-black font-mono text-white mt-2 block">91.8%</span>
                    <span className="text-[9px] text-indigo-400 uppercase font-bold tracking-wider mt-1 block">85 outreach cases resolved</span>
                  </Card>
                </div>

                {/* Toughest Courses Bar Chart */}
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Academic Delay Heatmap (Toughest Courses)</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Distribution of D/E grades frequency across core major subjects.</CardDescription>
                  </div>

                  <div className="h-64 w-full">
                    <Bar 
                      data={{
                        labels: ["Linear Algebra", "Calculus II", "Database Systems", "Web Programming", "Data Structures"],
                        datasets: [
                          {
                            label: "Total Failures (D/E count)",
                            data: [14, 18, 5, 8, 11],
                            backgroundColor: "rgba(99, 102, 241, 0.8)",
                            borderColor: "rgb(99, 102, 241)",
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { color: "#71717a", font: { size: 9 } } },
                          y: { grid: { color: "#18181b" }, ticks: { color: "#71717a", font: { size: 9 } } }
                        }}}
                      />
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
            </>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6 relative">
        {adminLevel !== 'admin' ? (
          renderLecturerView()
        ) : (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex gap-2 w-full overflow-x-auto border-b border-zinc-900 pb-3" data-lenis-prevent>
            {[
              { id: "student-details", label: t.studentAnalysis, icon: Users },
              { id: "insights", label: t.institutionalInsights, icon: Award },
              { id: "alerts", label: t.alerts, icon: ShieldAlert },
              { id: "users", label: t.userManagement, icon: UserPlus },
              { id: "integration", label: t.dataIntegration, icon: Database },
              { id: "model", label: t.aiModel, icon: Cpu },
              { id: "security", label: t.security, icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    adminTab === tab.id 
                      ? "bg-zinc-800 text-white border border-zinc-700/60" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            
            {/* SUB-TAB: STUDENT DETAILS */}
            {adminTab === "student-details" && (
              <motion.div
                key="student-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {renderLecturerView()}
              </motion.div>
            )}
            
            {/* SUB-TAB: INSTITUTIONAL INSIGHTS */}
            {adminTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Health Index Radial Dial */}
                  <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">University Health Index</span>
                    
                    <div className="relative w-32 h-32 flex items-center justify-center mt-5">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="50" stroke="#18181b" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="64" cy="64" r="50" 
                          stroke="#6366f1" 
                          strokeWidth="8" fill="transparent" 
                          strokeDasharray={314}
                          strokeDashoffset={314 - (314 * 88) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-white">88%</span>
                        <span className="text-[8px] uppercase tracking-widest text-zinc-400">Excellent</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-550 mt-4 leading-relaxed">
                      Aggregated institutional health tracking based on student graduation trajectories and drop-out rates.
                    </p>
                  </Card>

                  {/* Resource Allocations recommendations */}
                  <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                    <div className="border-b border-zinc-900 pb-3 mb-4">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">AI Strategic Resource Recommendations</CardTitle>
                    </div>

                    <div className="space-y-3 font-sans text-xs">
                      {[
                        { title: "Increase Tutorial Budgets", desc: "Allocate an additional 10% for Informatics class assistants to address Linear Algebra failure nodes." },
                        { title: "Financial Aid Re-alignment", desc: "Increase budget caps for installment models since payment delays represent 30% of current drop-out triggers." }
                      ].map((rec, i) => (
                        <div key={i} className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-xl space-y-1">
                          <h4 className="font-bold text-white">{rec.title}</h4>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">{rec.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB: ALERTS MANAGEMENT */}
            {adminTab === "alerts" && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Active System Alerts</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Real-time status warnings flagged by TRACIA sweep scripts.</CardDescription>
                  </div>

                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-3.5 border border-zinc-900 bg-zinc-950/20 rounded-xl flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵'}
                          </span>
                          <div>
                            <span className="font-semibold text-white block">{alert.msg}</span>
                            <span className="text-[9px] text-zinc-550 block font-mono mt-0.5">{alert.time}</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[9px] px-2 py-0 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                        >
                          Dismiss
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SUB-TAB: USER MANAGEMENT */}
            {adminTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Form to add user */}
                <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
                      {editingUser ? "Edit Campus Account" : "Register Campus Account"}
                    </CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">
                      {editingUser ? `Updating details for: ${editingUser}` : "Provision new student, faculty advisor, or administrative system users."}
                    </CardDescription>
                  </div>

                  <form onSubmit={handleAddUser} className="space-y-4 text-xs font-sans">
                    {userSuccessMsg && (
                      <div className="p-3 border border-indigo-950/20 bg-indigo-950/20 text-indigo-300 rounded-xl text-[10px] leading-relaxed">
                        <strong>[✓] Success:</strong> {userSuccessMsg}
                      </div>
                    )}
                    {userErrorMsg && (
                      <div className="p-3 border border-red-950/20 bg-red-950/20 text-red-400 rounded-xl text-[10px] leading-relaxed font-semibold">
                        <strong>[!] Error:</strong> {userErrorMsg}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Username / ID</label>
                      <input 
                        type="text" 
                        required
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        placeholder="e.g. kaprodi_ti"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Campus Email</label>
                      <input 
                        type="email" 
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. john@mhs.dinus.ac.id"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                      <input 
                        type="text" 
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder={editingUser ? "Leave blank to keep current" : "e.g. securePass123"}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">System Role Access</label>
                      <select 
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="lecturer-F11">Lecturer - Kaprodi TI (F11)</option>
                        <option value="lecturer-F12">Lecturer - Kaprodi SI (F12)</option>
                        <option value="lecturer-F13">Lecturer - Kaprodi Manajemen (F13)</option>
                        <option value="lecturer-F14">Lecturer - Kaprodi DKV (F14)</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-9 text-xs cursor-pointer">
                        {editingUser ? "Update Account" : "Register User Account"}
                      </Button>
                      {editingUser && (
                        <Button 
                          type="button" 
                          onClick={handleCancelEditUser}
                          variant="outline"
                          className="px-3 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white rounded-xl h-9 cursor-pointer"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>

                {/* User Database Table */}
                <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl overflow-hidden">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Authorized Account Database</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">List of active TRACIA credentials.</CardDescription>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto pr-1" data-lenis-prevent>
                    <table className="w-full text-left text-xs text-zinc-400 font-sans">
                      <thead className="bg-zinc-900/60 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        <tr>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Username</th>
                          <th className="px-4 py-2.5">Email</th>
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/20">
                            <td className="px-4 py-3">
                              <span className="font-bold text-white block">{u.name}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[10px] text-zinc-350">{u.username}</td>
                            <td className="px-4 py-3 font-mono text-[10px]">{u.email}</td>
                            <td className="px-4 py-3">
                              <Badge className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[8px] uppercase font-bold">{getRoleLabel(u.level)}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button 
                                  onClick={() => handleStartEditUser(u)}
                                  className="text-zinc-400 hover:text-white p-1.5 cursor-pointer"
                                  title="Edit User"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="text-red-400 hover:text-red-300 p-1.5 cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

              </motion.div>
            )}

            {/* SUB-TAB: DATA INTEGRATION */}
            {adminTab === "integration" && (
              <motion.div
                key="integration"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider font-sans">Academic API Data Synchronization Monitor</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Monitors synchronization tunnels with campus SIA, LMS, and payment channels.</CardDescription>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    {[
                      { system: "SIADIN Database Link", status: "Active", latency: "1.2s", sync: "2 mins ago" },
                      { system: "LMS Moodle Bridge", status: "Active", latency: "2.4s", sync: "5 mins ago" },
                      { system: "Briva Finance Gateway", status: "Active", latency: "0.8s", sync: "1 hour ago" }
                    ].map((sys, idx) => (
                      <div key={idx} className="p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{sys.system}</span>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold">{sys.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500">
                          <div>Latency: <span className="text-zinc-300 font-bold">{sys.latency}</span></div>
                          <div>Synced: <span className="text-zinc-300 font-bold">{sys.sync}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SUB-TAB: AI MODEL MANAGEMENT */}
            {adminTab === "model" && (
              <motion.div
                key="model"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* ML model stats */}
                  <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="border-b border-zinc-900 pb-3 mb-4">
                        <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">XGBoost Model Diagnostics</CardTitle>
                      </div>

                      <div className="space-y-4 text-xs font-mono font-sans text-zinc-400">
                        <div className="flex justify-between">
                          <span>Model Class:</span>
                          <span className="font-bold text-white font-mono text-[10.5px]">{modelMetrics.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy score:</span>
                          <span className="font-bold text-emerald-400 font-mono text-[10.5px]">{modelMetrics.accuracy.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>F1-Score:</span>
                          <span className="font-bold text-emerald-400 font-mono text-[10.5px]">{modelMetrics.f1Score.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Feature Drift:</span>
                          <span className="font-bold text-white font-mono text-[10.5px]">0.02 (Negligible)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Training:</span>
                          <span className="font-bold text-zinc-500 font-mono text-[9.5px]">{modelMetrics.lastTrained}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 space-y-4">
                      <Button 
                        onClick={handleRetrain}
                        disabled={isRetraining}
                        className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-9 text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                        {isRetraining ? "Retraining Model..." : "Trigger Model Retraining"}
                      </Button>
                    </div>
                  </Card>

                  {/* SHAP Summary Plot representation */}
                  <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                    <div className="border-b border-zinc-900 pb-3 mb-4">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">SHAP Tree Explainer Summary Insights</CardTitle>
                      <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Displays the global impact magnitude weights of student features on dropout risk classifications.</CardDescription>
                    </div>

                    {/* Styled list bar representation of SHAP features */}
                    <div className="space-y-4 text-xs font-sans">
                      {[
                        { feature: "Current GPA", shap: 0.38, desc: "Highest impact. Low cumulative grades heavily trigger positive dropout predictions.", color: "bg-indigo-500" },
                        { feature: "Payment Status (Late fees)", shap: 0.28, desc: "Late or outstanding semester billing accounts display high risk correlations.", color: "bg-pink-500" },
                        { feature: "Credit Completion Velocity", shap: 0.18, desc: "Lower completed credits per semester indicators raise delays risks.", color: "bg-sky-500" },
                        { feature: "Lecture Attendance Rate", shap: 0.12, desc: "Dropouts are highly correlated with classroom skip events.", color: "bg-emerald-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white font-mono text-[10.5px]">{item.feature}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">SHAP Weight: +{item.shap.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full`} style={{ width: `${item.shap * 180}%` }} />
                          </div>
                          <span className="text-[9.5px] text-zinc-500 leading-snug block mt-0.5">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Retrain console logs */}
                {retrainLogs.length > 0 && (
                  <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl">
                    <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-2 font-mono">Retraining Pipeline Logs</span>
                    <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl font-mono text-[9px] text-zinc-400 space-y-1 h-32 overflow-y-auto" data-lenis-prevent>
                      {retrainLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {/* SUB-TAB: CONFIG & SECURITY */}
            {adminTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-5">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Access Control & Security Settings</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Configuration parameter flags for security compliance and JWT integration.</CardDescription>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans text-zinc-400">
                    <div className="p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl space-y-3">
                      <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Role Permissions Config</span>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Super Admin Panel Access</span>
                          <span className="text-emerald-400 font-bold font-mono">ENABLED</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Lecturer Intervention Logs</span>
                          <span className="text-emerald-400 font-bold font-mono">ENABLED</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Retraining API Endpoint Trigger</span>
                          <span className="text-emerald-400 font-bold font-mono">ENABLED</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl space-y-3">
                      <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Integration Token Key Details</span>
                      <div className="space-y-2 text-[10px] font-mono text-zinc-500">
                        <div className="flex justify-between">
                          <span>JWT Access Token Expiry</span>
                          <span className="text-zinc-300">15 mins</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Refresh Token Persistence</span>
                          <span className="text-zinc-300">7 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance Status</span>
                          <span className="text-emerald-400 font-bold">Standard Audited</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

      {/* Email Modal Dialog Portal */}
      {isEmailModalOpen && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm transition-all duration-300">
          <Card className="relative w-full max-w-lg overflow-hidden border border-zinc-800 bg-zinc-950 text-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="px-6 py-4 bg-zinc-900/50 border-b border-zinc-800/80 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Send Email to Student</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500 mt-0.5 font-medium">Send notification or academic guidance warning notice.</CardDescription>
              </div>
              <button 
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-sans">Sender (Admin)</label>
                  <input 
                    type="text" 
                    value={`${adminName} (${adminUsername})`}
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-sans">Recipient (Student)</label>
                  <input 
                    type="email" 
                    value={student.email}
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed font-mono font-medium" 
                  />
                </div>

                <div>
                  <label htmlFor="modal-email-subject" className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-sans">Email Subject</label>
                  <input 
                    type="text" 
                    id="modal-email-subject" 
                    required 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..." 
                    className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="modal-email-message" className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-sans">Message / Content</label>
                  <textarea 
                    id="modal-email-message" 
                    required 
                    rows={5} 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write academic outreach warning text here..." 
                    className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-medium"
                  ></textarea>
                </div>

                {emailStatus && (
                  <div className={`text-[11px] p-2.5 rounded-xl border font-medium ${
                    emailStatus.type === 'success' ? 'border-indigo-500/20 bg-indigo-500/5 text-white font-semibold' : 'border-red-950 bg-red-950/20 text-red-400'
                  }`}>
                    {emailStatus.msg}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer h-9"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSendingEmail}
                    className="px-4 py-2 bg-white !text-black hover:bg-zinc-200 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 h-9"
                  >
                    {isSendingEmail ? (
                      <>
                        <span className="!text-black">Sending...</span>
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      </>
                    ) : (
                      <span className="!text-black">Send Outreach Email</span>
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
