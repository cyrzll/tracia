import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, BookOpen, GraduationCap, Award, Compass, MessageSquare, 
  CheckCircle2, AlertTriangle, Zap, TrendingUp, DollarSign, Calendar,
  Award as BadgeIcon, Clock, ChevronRight, Search, Bookmark, BookmarkCheck,
  Send, Sparkles, AlertCircle, RefreshCw, BarChart2, BookOpenCheck, ShieldAlert
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { KrsAccordion } from "./KrsAccordion"
import { TranscriptView } from "./TranscriptView"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

import type { Student, Billing, SemesterKrs, CourseGrade, KhsHeader } from "@/types"
import { getTranslation, type LangCode } from "../utils/lang"

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

const OPPORTUNITIES = [
  {
    id: "opt-1",
    title: "AI Engineer Intern",
    company: "Tokopedia",
    type: "Internship",
    location: "Jakarta, Indonesia (Hybrid)",
    gpaReq: 3.0,
    matchReason: "Matches your programming skills and cumulative GPA.",
    link: "#"
  },
  {
    id: "opt-2",
    title: "Djarum Beasiswa Plus",
    company: "Djarum Foundation",
    type: "Scholarship",
    location: "National",
    gpaReq: 3.2,
    matchReason: "High GPA and SKS match.",
    link: "#"
  },
  {
    id: "opt-3",
    title: "Gemastik XIX Programming Competition",
    company: "Puspresnas",
    type: "Competition",
    location: "National",
    gpaReq: 0,
    matchReason: "Excellent match for student coders.",
    link: "#"
  },
  {
    id: "opt-4",
    title: "AWS Academy Cloud Foundations",
    company: "Amazon Web Services",
    type: "Certification",
    location: "Online",
    gpaReq: 0,
    matchReason: "Compliments your SKS credit requirements in Computer Science.",
    link: "#"
  },
  {
    id: "opt-5",
    title: "Data Scientist Intern",
    company: "Shopee Singapore",
    type: "Internship",
    location: "Singapore",
    gpaReq: 3.5,
    matchReason: "Requires high academic performance.",
    link: "#"
  },
  {
    id: "opt-6",
    title: "YSEALI Academic Fellowship",
    company: "U.S. Department of State",
    type: "Scholarship",
    location: "United States / ASEAN",
    gpaReq: 3.25,
    matchReason: "Fits your leadership and student profile.",
    link: "#"
  }
];

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

  // Navigation State
  const [activeTab, setActiveTab] = React.useState("overview");

  // State linked to LocalStorage for persistence
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("mhs_bookmarks", []);
  const [xp, setXp] = useLocalStorage<number>("mhs_xp", 120);
  const [streak, setStreak] = useLocalStorage<number>("mhs_streak", 3);
  const [completedQuests, setCompletedQuests] = useLocalStorage<string[]>("mhs_completed_quests", []);
  const [recoveryChecklist, setRecoveryChecklist] = useLocalStorage<string[]>("mhs_recovery_checklist", []);
  const [messages, setMessages] = useLocalStorage<Array<{ sender: 'ai' | 'user' | 'lecturer'; text: string; time: string }>>(
    `mhs_chat_${student.nim}`,
    [
      { sender: 'ai', text: `Hello ${student.nama}! I am your TRACIA AI Mentor. I have reviewed your academic profile (GPA: ${student.gpa.toFixed(2)}, Risk: ${prediction?.risk_level || 'Low'}). How can I support your study progress today?`, time: "10:00" }
    ]
  );
  const [inputMsg, setInputMsg] = React.useState("");

  // Search & Filter State for Opportunities
  const [searchQuery, setSearchQuery] = React.useState("");
  const [opportunityFilter, setOpportunityFilter] = React.useState("All");

  // Success Potential Calculation
  const successPotential = prediction ? Math.round((1 - prediction.dropout_risk_probability) * 100) : 100;
  const failedCourses = transcript ? transcript.filter(c => c.nl === 'D' || c.nl === 'E').length : 0;

  // Gamification Levels
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;

  const handleQuestToggle = (questId: string, xpReward: number) => {
    if (completedQuests.includes(questId)) {
      setCompletedQuests(completedQuests.filter(id => id !== questId));
      setXp(Math.max(0, xp - xpReward));
    } else {
      setCompletedQuests([...completedQuests, questId]);
      setXp(xp + xpReward);
      // Increment streak for completed quest
      if (completedQuests.length === 0 || Math.random() > 0.5) {
        setStreak(streak + 1);
      }
    }
  };

  const handleRecoveryToggle = (item: string) => {
    if (recoveryChecklist.includes(item)) {
      setRecoveryChecklist(recoveryChecklist.filter(i => i !== item));
    } else {
      setRecoveryChecklist([...recoveryChecklist, item]);
    }
  };

  const toggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(b => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  // Chat with AI Mentor logic
  const handleSendMessage = (textToSend = inputMsg) => {
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setMessages(newMsgs);
    setInputMsg("");

    // AI Response Simulation
    setTimeout(() => {
      let responseText = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("gpa") || lower.includes("ipk") || lower.includes("nilai")) {
        responseText = `Your current Cumulative GPA is ${student.gpa.toFixed(2)}. ${
          student.gpa >= 3.0 
            ? "This is a strong performance! Continue to maintain this in your major classes to stay eligible for top internships and scholarships." 
            : "Since it is below 3.0, let's focus on academic recovery. Retaking courses with D/E grades is the fastest way to pull your GPA back above 3.0."
        }`;
      } else if (lower.includes("risk") || lower.includes("dropout") || lower.includes("bahaya")) {
        responseText = `According to the machine learning prediction, your Dropout Risk Level is ${prediction?.risk_level || 'Low'} (${(prediction?.dropout_risk_probability ? prediction.dropout_risk_probability * 100 : 0).toFixed(1)}%). ${
          student.risk_level === 'Low'
            ? "You are doing great! Keep attending your classes regularly and submit all assignments on time."
            : "Let's work together to manage this. The key factors include addressing your billing status and discussing with your academic advisor to request interventions."
        }`;
      } else if (lower.includes("scholarship") || lower.includes("beasiswa") || lower.includes("magang") || lower.includes("intern")) {
        responseText = `Based on your profile, you have a solid matching score for the Djarum Beasiswa Plus scholarship and the AI Engineer Internship at Tokopedia. You can find detailed requirements in the Opportunity Hub tab!`;
      } else if (lower.includes("quest") || lower.includes("xp") || lower.includes("game")) {
        responseText = `You are currently Level ${level} with ${xp} XP. Complete your daily quests and study checklist items to earn more XP and climb the university leaderboard!`;
      } else {
        responseText = `I understand. Keeping your attendance above 90% and resolving any unpaid financial billing are priority tasks to maintain a high academic potential score. Is there anything else you want to ask about your study plan (KRS) or grades?`;
      }

      setMessages([
        ...newMsgs,
        { sender: 'ai', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1000);
  };

  // Mock Recovery Journey Roadmap Steps
  const recoverySteps = [
    { title: "Review KRS", desc: "Consult with academic advisor regarding SKS loads", status: "completed" },
    { title: "Financial Clearance", desc: "Settle outstanding SPP and polyclinic fees", status: isHeartHealthy ? "completed" : "pending" },
    { title: "Remedial / Retake Exam", desc: "Enroll in remedial modules for D/E courses", status: isHandsHealthy ? "completed" : "pending" },
    { title: "Attendance Tracking", desc: "Ensure class attendance rates are above 90%", status: "pending" }
  ];

  // Daily / Epic Quests Mock Data
  const quests = [
    { id: "q-1", title: "Daily Check-in", desc: "Access the TRACIA academic portal today.", type: "daily", xp: 10 },
    { id: "q-2", title: "Study Goal", desc: "Read 1 lecture note or complete 1 practice code.", type: "daily", xp: 20 },
    { id: "q-3", title: "Streak Master", desc: "Maintain a study streak of 5 consecutive days.", type: "epic", xp: 50 },
    { id: "q-4", title: "Financial Shield", desc: "Pay current semester bill before UTS deadline.", type: "epic", xp: 100 }
  ];

  // Mock Leaderboard
  const leaderboard = [
    { rank: 1, name: "David Alfarizi", gpa: 3.92, xp: 850, isCurrent: false },
    { rank: 2, name: "Lestari Wahyuni", gpa: 3.85, xp: 720, isCurrent: false },
    { rank: 3, name: "Budi Santoso", gpa: 3.74, xp: 600, isCurrent: false },
    { rank: 4, name: student.nama, gpa: student.gpa, xp: xp, isCurrent: true },
    { rank: 5, name: "Siti Rahma", gpa: 3.12, xp: 110, isCurrent: false }
  ].sort((a, b) => b.xp - a.xp).map((item, index) => ({ ...item, rank: index + 1 }));

  // Sidebar Tabs config
  const tabs = [
    { id: "overview", label: t.studentPortal, icon: User },
    { id: "recovery", label: t.recoveryRoadmap, icon: TrendingUp },
    { id: "opportunities", label: t.opportunityHub, icon: Compass },
    { id: "quests", label: t.quests, icon: Award },
    { id: "messages", label: t.messages, icon: MessageSquare },
    { id: "academics", label: t.academics, icon: BookOpen },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      
      {/* Left Sidebar Navigation */}
      <div className="md:col-span-1 space-y-4">
        {/* Student Quick Profile Card */}
        <Card className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden p-5 flex flex-col items-center rounded-2xl text-white">
          <div className="w-24 h-24 rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900 mb-3 relative group">
            <img 
              src={student.foto} 
              alt={student.nama} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
              <span className="text-[9px] uppercase font-bold text-white tracking-widest">Profile</span>
            </div>
          </div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wide text-center truncate max-w-full">{student.nama}</h2>
          <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{student.nim}</p>
          
          <div className="w-full border-t border-zinc-900 my-3 pt-3 flex justify-between items-center text-[10px]">
            <span className="text-zinc-500 uppercase tracking-widest">Level {level}</span>
            <span className="text-zinc-300 font-mono font-bold">{xpInCurrentLevel}/100 XP</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${xpInCurrentLevel}%` }} />
          </div>
        </Card>

        {/* Tab Selection Navigation */}
        <div className="flex flex-col gap-1 border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md p-2 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition-all duration-300 ${
                  isActive 
                    ? "bg-zinc-850/80 text-white shadow-md shadow-indigo-500/5 border border-zinc-800/50" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="md:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Success Potential Radial card */}
                <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-[9px] font-bold text-emerald-400 tracking-wider">AI Score</div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.successPotential}</span>
                  
                  <div className="relative w-36 h-36 flex items-center justify-center mt-5">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="58" stroke="#18181b" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="72" cy="72" r="58" 
                        stroke="url(#successGradient)" 
                        strokeWidth="8" fill="transparent" 
                        strokeDasharray={364}
                        strokeDashoffset={364 - (364 * successPotential) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black tracking-tighter text-white">{successPotential}%</span>
                      <span className="text-[8px] uppercase tracking-widest text-zinc-400">Potential</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed">
                    Based on machine learning parameters. A higher score reflects solid GPA and clean payment logs.
                  </p>
                </Card>

                {/* Study Health Visual Metaphor */}
                <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {t.successPotential} Indicators
                    </CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Visual metrics mapping student dropout susceptibility factors.</CardDescription>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className={`p-3.5 border rounded-xl flex flex-col items-center text-center transition-all ${
                      isBrainHealthy ? 'border-zinc-800/80 bg-zinc-900/10' : 'border-red-950/50 bg-red-950/10'
                    }`}>
                      <span className="text-xl">🧠</span>
                      <span className="text-[10px] font-bold text-zinc-400 mt-2 block uppercase tracking-wider">{t.gpaStatus}</span>
                      <span className={`text-xs font-bold mt-1 block ${isBrainHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                        {student.gpa.toFixed(2)}
                      </span>
                    </div>

                    <div className={`p-3.5 border rounded-xl flex flex-col items-center text-center transition-all ${
                      isHeartHealthy ? 'border-zinc-800/80 bg-zinc-900/10' : 'border-red-950/50 bg-red-950/10'
                    }`}>
                      <span className="text-xl">❤️</span>
                      <span className="text-[10px] font-bold text-zinc-400 mt-2 block uppercase tracking-wider">{t.financials}</span>
                      <span className={`text-xs font-bold mt-1 block ${isHeartHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isHeartHealthy ? "Paid" : "Unpaid"}
                      </span>
                    </div>

                    <div className={`p-3.5 border rounded-xl flex flex-col items-center text-center transition-all ${
                      isHandsHealthy ? 'border-zinc-800/80 bg-zinc-900/10' : 'border-red-950/50 bg-red-950/10'
                    }`}>
                      <span className="text-xl">🙌</span>
                      <span className="text-[10px] font-bold text-zinc-400 mt-2 block uppercase tracking-wider">{t.coursePasses}</span>
                      <span className={`text-xs font-bold mt-1 block ${isHandsHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                        {failedCourses === 0 ? "Clear" : `${failedCourses} Failed`}
                      </span>
                    </div>

                    <div className={`p-3.5 border rounded-xl flex flex-col items-center text-center transition-all ${
                      isFeetHealthy ? 'border-zinc-800/80 bg-zinc-900/10' : 'border-red-950/50 bg-red-950/10'
                    }`}>
                      <span className="text-xl">⚡</span>
                      <span className="text-[10px] font-bold text-zinc-400 mt-2 block uppercase tracking-wider">{t.creditVelocity}</span>
                      <span className={`text-xs font-bold mt-1 block ${isFeetHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                        {velocity.toFixed(1)}/sem
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-zinc-900 pt-3 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Last Sync: {new Date(student.updatedAt).toLocaleString()}</span>
                    <span>Algorithm: XGBoost v2.0</span>
                  </div>
                </Card>
              </div>

              {/* AI Insights & Priority Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Growth Insights */}
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="border-b border-zinc-900 pb-3 mb-4">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        AI Growth Insights
                      </CardTitle>
                    </div>
                    <p className="text-xs text-zinc-350 leading-relaxed font-medium">
                      {prediction?.risk_level === 'Low' ? (
                        "You are performing above academic benchmarks. SKS accumulative speeds match graduation pathways. To optimize career paths, consider reviewing scholarship recommendations in the Opportunity Hub."
                      ) : (
                        "We noticed a medium/high risk of delay or drop-out due to outstanding bill payments and credit speed levels. It is critical to follow the custom Recovery Journey checklist immediately to mitigate these triggers."
                      )}
                    </p>
                  </div>
                  
                  <div className="mt-6 border-t border-zinc-900 pt-4 flex gap-4">
                    <Button onClick={() => setActiveTab("recovery")} className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-xl py-4 font-bold text-xs h-9 cursor-pointer">
                      Open Recovery Roadmap
                    </Button>
                    <Button onClick={() => setActiveTab("messages")} variant="outline" className="flex-1 border-zinc-850 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl py-4 text-xs h-9 cursor-pointer">
                      Consult AI Mentor
                    </Button>
                  </div>
                </Card>

                {/* Priority Tasks Checklist */}
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Priority Study Actions</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Tasks compiled by AI to boost academic success potentials.</CardDescription>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: "task-1", text: "Pay outstanding billing tagihan semester", done: isHeartHealthy },
                      { id: "task-2", text: "Maintain lecture attendance rate above 90%", done: true },
                      { id: "task-3", text: "Schedule 1 consultation consultation session with Dosen Wali", done: false },
                      { id: "task-4", text: "Check upcoming midterm exam schedule", done: false }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/20 border border-zinc-900/60 text-xs">
                        <span className={`font-medium ${item.done ? 'line-through text-zinc-550' : 'text-zinc-300'}`}>{item.text}</span>
                        {item.done ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">Finished</Badge>
                        ) : (
                          <Badge className="bg-zinc-800 text-zinc-450 border border-zinc-700 text-[9px]">To Do</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Lecturer Intervention Alert Board */}
              <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                <div className="border-b border-zinc-900 pb-3 mb-4">
                  <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Lecturer Intervention & Nudges
                  </CardTitle>
                  <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Academic alerts and directives issued by faculty advisors.</CardDescription>
                </div>
                
                <div className="space-y-4">
                  {prediction?.risk_level !== 'Low' ? (
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3.5">
                      <div className="text-xl">⚠️</div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Academic Warning Notice</h4>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          Your lecturer has flagged your account for medium/high dropout risk parameters. Please coordinate directly with your academic supervisor.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-zinc-550 text-xs font-medium border border-zinc-900 bg-zinc-950/20 rounded-xl">
                      No active academic warnings or student intervention notices found.
                    </div>
                  )}
                </div>
              </Card>

            </motion.div>
          )}

          {/* TAB 2: RECOVERY JOURNEY */}
          {activeTab === "recovery" && (
            <motion.div
              key="recovery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Recovery Roadmap & Progression checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Roadmap steps */}
                <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="border-b border-zinc-900 pb-3 mb-5">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Recovery Roadmap</CardTitle>
                    </div>
                    
                    <div className="space-y-6 relative border-l border-zinc-800 pl-4 ml-2">
                      {recoverySteps.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[25px] top-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] ${
                            step.status === 'completed' 
                              ? 'bg-indigo-500 border-indigo-400 text-white' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${step.status === 'completed' ? 'text-white' : 'text-zinc-400'}`}>{step.title}</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900 text-[10px] text-zinc-400 leading-relaxed">
                    <span className="font-bold text-white block mb-0.5">Roadmap Recommendation</span>
                    Follow steps in order. Completing items updates your risk metrics at next daily system sweep.
                  </div>
                </Card>

                {/* Progress Checklist & Recovery Graph */}
                <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">AI Priority Action Checklist</CardTitle>
                      <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Toggle status of completed remedial tasks.</CardDescription>
                    </div>
                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] uppercase font-bold">
                      {recoveryChecklist.length} / 4 Done
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { id: "rec-1", task: "Settle outstanding SPP tuition fees", reason: "Unpaid status raises drop-out prediction probabilities.", weight: "Critical" },
                      { id: "rec-2", task: "Attend counseling with Dosen Wali", reason: "Consultation logged by supervisor clears student warning states.", weight: "High" },
                      { id: "rec-3", task: "Retake failed course grades", reason: "Clearing D/E grades immediately raises GPA totals above 3.0.", weight: "Medium" },
                      { id: "rec-4", task: "Increase class attendance to 95%", done: true, reason: "Consistent classroom engagement metrics lower dropout alerts.", weight: "High" }
                    ].map((item) => {
                      const isDone = recoveryChecklist.includes(item.id);
                      return (
                        <div key={item.id} className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-xl flex items-start gap-3 justify-between">
                          <div className="flex items-start gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={isDone}
                              onChange={() => handleRecoveryToggle(item.id)}
                              className="mt-0.5 w-3.5 h-3.5 border-zinc-800 bg-zinc-900 rounded text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <span className={`text-xs font-semibold block ${isDone ? 'line-through text-zinc-550' : 'text-white'}`}>{item.task}</span>
                              <span className="text-[10px] text-zinc-500 mt-0.5 block leading-normal">{item.reason}</span>
                            </div>
                          </div>
                          <Badge className={`text-[8px] uppercase tracking-wider font-bold ${
                            item.weight === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            item.weight === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {item.weight}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>

                  {/* Recovery Progression Graph */}
                  <div className="border-t border-zinc-900 pt-5">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Recovery Progression Trend</span>
                    <div className="h-44 w-full">
                      <Line 
                        data={{
                          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
                          datasets: [
                            {
                              label: "Recovery Score (%)",
                              data: [30, 45, 60, 65, 80, 95],
                              borderColor: "#6366f1",
                              backgroundColor: "rgba(99, 102, 241, 0.1)",
                              tension: 0.4,
                              fill: true,
                              borderWidth: 2,
                              pointRadius: 3,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false }
                          },
                          scales: {
                            y: {
                              grid: { color: "#18181b" },
                              ticks: { color: "#71717a", font: { size: 9 } }
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: "#71717a", font: { size: 9 } }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 3: OPPORTUNITY HUB */}
          {activeTab === "opportunities" && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-4 rounded-2xl text-white">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search opportunities..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto" data-lenis-prevent>
                  {["All", "Internship", "Scholarship", "Competition", "Certification"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOpportunityFilter(filter)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                        opportunityFilter === filter 
                          ? "bg-white text-black border-white" 
                          : "border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {OPPORTUNITIES.filter(opt => {
                  const matchesSearch = opt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      opt.company.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFilter = opportunityFilter === "All" || opt.type === opportunityFilter;
                  return matchesSearch && matchesFilter;
                }).map((opt) => {
                  const isBookmarked = bookmarks.includes(opt.id);
                  // Dynamic AI Match Score computation
                  let matchScore = 75;
                  if (student.gpa >= opt.gpaReq && opt.gpaReq > 0) matchScore = 95;
                  else if (opt.gpaReq > 0) matchScore = 55;
                  
                  return (
                    <Card key={opt.id} className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] uppercase font-bold">{opt.type}</Badge>
                            <h3 className="text-sm font-bold text-white mt-2 leading-snug">{opt.title}</h3>
                            <span className="text-[10px] text-zinc-400 font-semibold">{opt.company}</span>
                          </div>
                          
                          <button 
                            onClick={() => toggleBookmark(opt.id)}
                            className="text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500">
                          <div>
                            <span className="text-zinc-400">Location:</span>
                            <span className="text-zinc-300 block font-sans">{opt.location}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Min GPA:</span>
                            <span className="text-zinc-300 block">{opt.gpaReq > 0 ? opt.gpaReq.toFixed(2) : "None"}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed bg-zinc-900/20 p-2.5 rounded-xl border border-zinc-900">
                          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[9px] block mb-0.5">AI MATCH INSIGHT</span>
                          {opt.matchReason}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-zinc-900 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">AI Match Score</span>
                          <span className={`text-xs font-black ${matchScore >= 90 ? 'text-emerald-400' : matchScore >= 70 ? 'text-indigo-400' : 'text-zinc-400'}`}>{matchScore}%</span>
                        </div>
                        
                        <Button className="bg-white text-black hover:bg-zinc-200 rounded-xl h-8 px-3 py-1 text-xs font-bold cursor-pointer">
                          Apply Now
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Goal Setting tracker */}
              <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                <div className="border-b border-zinc-900 pb-3 mb-4">
                  <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Career Goal Progress Tracker</CardTitle>
                  <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Aligning SKS credits and GPA requirements with future occupations.</CardDescription>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-white">Goal: Data Scientist</span>
                      <span className="text-indigo-400">82% Completed</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: "82%" }} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] font-mono text-zinc-500 pt-2">
                    <div className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-xl">
                      <span className="text-zinc-400 uppercase tracking-wider">Required GPA</span>
                      <span className="text-xs font-bold text-white block mt-1">3.50</span>
                      <span className="text-emerald-400 text-[8px] uppercase font-bold mt-1 block">GPA: {student.gpa.toFixed(2)} (Eligible)</span>
                    </div>
                    <div className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-xl">
                      <span className="text-zinc-400 uppercase tracking-wider">Required SKS</span>
                      <span className="text-xs font-bold text-white block mt-1">144 SKS</span>
                      <span className="text-indigo-400 text-[8px] uppercase font-bold mt-1 block">Completed: {khsHeader ? khsHeader.total_sks : 0} SKS</span>
                    </div>
                    <div className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-xl">
                      <span className="text-zinc-400 uppercase tracking-wider">Specializations</span>
                      <span className="text-xs font-bold text-white block mt-1">Machine Learning, Stats</span>
                      <span className="text-zinc-500 text-[8px] uppercase mt-1 block">3 Courses Enrolled</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 4: QUESTS & GAMIFICATION */}
          {activeTab === "quests" && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Level & XP progression card */}
                <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl text-center flex flex-col justify-between">
                  <div>
                    <div className="border-b border-zinc-900 pb-3 mb-5">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Academic Level Status</CardTitle>
                    </div>

                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-2xl mb-4">
                      <BadgeIcon className="w-10 h-10 text-indigo-400" />
                    </div>

                    <h3 className="text-sm font-bold text-white">Level {level}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Sophomore Scholar</p>

                    <div className="mt-6 flex justify-between text-[10px] font-mono text-zinc-500 mb-1.5">
                      <span>XP Progress</span>
                      <span>{xpInCurrentLevel} / 100 XP</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${xpInCurrentLevel}%` }} />
                    </div>
                  </div>

                  <div className="mt-6 border-t border-zinc-900 pt-4 flex justify-around">
                    <div className="text-center">
                      <span className="text-xs font-black text-white">{streak} Days</span>
                      <span className="block text-[8px] text-zinc-500 uppercase mt-0.5">Streak</span>
                    </div>
                    <div className="text-center border-l border-zinc-900 pl-6">
                      <span className="text-xs font-black text-white">{completedQuests.length}</span>
                      <span className="block text-[8px] text-zinc-500 uppercase mt-0.5">Quests Cleared</span>
                    </div>
                  </div>
                </Card>

                {/* Quests lists */}
                <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Quest Mission Log</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Clear quests daily to earn XP and strengthen study records.</CardDescription>
                  </div>
                  
                  <div className="space-y-3">
                    {quests.map((q) => {
                      const isDone = completedQuests.includes(q.id);
                      return (
                        <div 
                          key={q.id} 
                          onClick={() => handleQuestToggle(q.id, q.xp)}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 ${
                            isDone 
                              ? 'border-indigo-500/20 bg-indigo-500/5' 
                              : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] ${
                              isDone ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-zinc-700 bg-zinc-900'
                            }`}>
                              {isDone && "✓"}
                            </div>
                            <div>
                              <span className={`text-xs font-semibold block ${isDone ? 'line-through text-zinc-550' : 'text-white'}`}>{q.title}</span>
                              <span className="text-[10px] text-zinc-500 mt-0.5 block leading-none">{q.desc}</span>
                            </div>
                          </div>
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px]">+{q.xp} XP</Badge>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Leaderboard & Badge award systems */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Academic Leaderboard */}
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                      Academic XP Leaderboard
                    </CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Top performing students ranked by XP milestones.</CardDescription>
                  </div>
                  
                  <div className="space-y-2.5">
                    {leaderboard.map((item) => (
                      <div 
                        key={item.rank}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                          item.isCurrent ? 'bg-indigo-500/10 border border-indigo-500/20' : 'border border-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-4.5 font-bold font-mono text-zinc-500 text-center">{item.rank}</span>
                          <span className={`font-semibold ${item.isCurrent ? 'text-white' : 'text-zinc-350'}`}>{item.name}</span>
                          {item.isCurrent && <Badge className="bg-indigo-500 text-white text-[8px] scale-90 px-1 py-0 font-bold uppercase">You</Badge>}
                        </div>
                        <div className="flex items-center gap-4 font-mono text-[10px]">
                          <span className="text-zinc-500">GPA: {item.gpa.toFixed(2)}</span>
                          <span className="font-bold text-white">{item.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Badge Awards grid */}
                <Card className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl">
                  <div className="border-b border-zinc-900 pb-3 mb-4">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Badge Achievements</CardTitle>
                    <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Special academic badges unlocked from milestones.</CardDescription>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 pt-1">
                    {[
                      { icon: "🎓", label: "Alpha Scholar", desc: "GPA >= 3.5", unlocked: student.gpa >= 3.5 },
                      { icon: "💸", label: "Early Shield", desc: "No bill delays", unlocked: isHeartHealthy },
                      { icon: "🔥", label: "Streak Master", desc: "5-day login", unlocked: streak >= 5 },
                      { icon: "🛡️", label: "Clean Record", desc: "Zero failed courses", unlocked: failedCourses === 0 }
                    ].map((badge, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 border rounded-xl flex flex-col items-center text-center justify-center ${
                          badge.unlocked 
                            ? 'border-zinc-800/80 bg-zinc-900/10 opacity-100' 
                            : 'border-zinc-900/50 bg-zinc-950/20 opacity-30'
                        }`}
                      >
                        <span className="text-xl">{badge.icon}</span>
                        <span className="text-[8px] font-bold text-white mt-2 block leading-snug">{badge.label}</span>
                        <span className="text-[7px] text-zinc-500 block mt-0.5 leading-none">{badge.desc}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 5: MESSAGES & AI MENTOR */}
          {activeTab === "messages" && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Messages & Chat layout */}
              <Card className="lg:col-span-2 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between h-[550px]">
                <div>
                  <div className="border-b border-zinc-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        TRACIA AI Mentor
                      </CardTitle>
                      <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Context-aware advice utilizing cumulative GPA and prediction data.</CardDescription>
                    </div>
                  </div>

                  {/* Messages Bubble Area */}
                  <div className="h-[370px] overflow-y-auto space-y-4 pr-1 font-sans text-xs" data-lenis-prevent>
                    {messages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex flex-col ${
                          msg.sender === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : msg.sender === 'lecturer'
                            ? 'bg-amber-600/10 border border-amber-500/20 text-white rounded-tl-none'
                            : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-none'
                        }`}>
                          {msg.sender === 'lecturer' && (
                            <span className="text-[8px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                              Lecturer Intervention Notice
                            </span>
                          )}
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-zinc-550 font-mono mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Controls Area */}
                <div className="border-t border-zinc-900 pt-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ask AI Mentor academic questions..." 
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 text-xs px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                    <Button 
                      onClick={() => handleSendMessage()} 
                      className="bg-white text-black hover:bg-zinc-200 rounded-xl px-4 h-9 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  {/* Quick responses list */}
                  <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1" data-lenis-prevent>
                    {[
                      "How do I improve my GPA?",
                      "Am I in danger of dropping out?",
                      "What scholarships fit my SKS?"
                    ].map((btnText, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSendMessage(btnText)}
                        className="text-[9px] font-bold px-2.5 py-1.5 border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400 hover:text-white rounded-xl whitespace-nowrap cursor-pointer transition-all"
                      >
                        {btnText}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Dosen Intervention details list */}
              <Card className="lg:col-span-1 border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 rounded-2xl h-[550px] overflow-y-auto" data-lenis-prevent>
                <div className="border-b border-zinc-900 pb-3 mb-4">
                  <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Dosen Intervention Logs
                  </CardTitle>
                  <CardDescription className="text-[9px] text-zinc-500 mt-0.5">Formal consultation interventions registered by faculty.</CardDescription>
                </div>
                
                <div className="space-y-4">
                  {[
                    { date: "2026-06-10", type: "Billing Alert", lecturer: "Dr. Budiarto, M.T.", note: "Tuition fee warning issued. Payment status must be resolved before midterms." },
                    { date: "2026-06-02", type: "Academic Consultation", lecturer: "Prof. Dr. Ir. Edi Noersasongko", note: "Consultation booked. Evaluated SKS completion rate velocity trends." }
                  ].map((log, index) => (
                    <div key={index} className="p-3 border border-zinc-900 bg-zinc-950/20 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-indigo-400">{log.type}</span>
                        <span className="font-mono text-zinc-500">{log.date}</span>
                      </div>
                      <p className="text-zinc-350 leading-relaxed font-medium">{log.note}</p>
                      <div className="border-t border-zinc-900 pt-2 text-[9px] text-zinc-500 flex justify-between font-mono">
                        <span>Lecturer: {log.lecturer}</span>
                        <span className="text-emerald-400 uppercase font-bold">Logged</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 6: ACADEMIC DOCUMENTS */}
          {activeTab === "academics" && (
            <motion.div
              key="academics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <KrsAccordion currentKrs={currentKrs} pastKrs={pastKrs} />
              <TranscriptView transcript={transcript} khsHeader={khsHeader} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
