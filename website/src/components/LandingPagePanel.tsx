import * as React from "react";
import { motion } from "framer-motion";

interface LandingPagePanelProps {
  isLoggedIn: boolean;
  adminName: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.6
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16
    }
  }
};

export function LandingPagePanel({ isLoggedIn, adminName }: LandingPagePanelProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-850 selection:bg-zinc-200 selection:text-black overflow-x-hidden">
      {/* Top Navigation Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.ico" alt="TRACIA AI" className="w-6 h-6 object-contain" />
            <span className="font-bold text-sm tracking-wider text-zinc-900">TRACIA AI</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-zinc-200 text-zinc-500 bg-white">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse"></span>
              AI Engine Active
            </span>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Syncing Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-500 text-xs font-medium mb-8"
        >
          <span>Academic Update Syncing Active</span>
        </motion.div>

        {/* H1 Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, type: "spring", stiffness: 60, damping: 15 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 mb-6 leading-tight font-sans"
        >
          Early Detection & Analysis <br/>
          <span className="text-zinc-500">
            of Student Dropout Risk
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="max-w-xl mx-auto text-sm sm:text-base text-zinc-500 leading-relaxed mb-12"
        >
          Minimalist analytics platform based on artificial intelligence (XGBoost & Optuna Machine Learning) to monitor, predict, and provide targeted interventions to proactively reduce university dropout rates.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          {isLoggedIn ? (
            <motion.a
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              href="/dash/admin"
              className="px-6 py-3 rounded bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold text-zinc-50 transition-colors w-full sm:w-auto text-center shadow-sm"
            >
              Admin Dashboard ({adminName})
            </motion.a>
          ) : (
            <motion.a
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              href="/login"
              className="px-6 py-3 rounded bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold text-zinc-50 transition-colors w-full sm:w-auto text-center shadow-sm"
            >
              Admin Portal Login
            </motion.a>
          )}
          <motion.a
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            href="https://github.com/tracia-AI/Student-Risk-Predictor"
            target="_blank"
            className="px-6 py-3 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-semibold text-zinc-800 transition-colors w-full sm:w-auto text-center shadow-sm"
          >
            API Documentation
          </motion.a>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-zinc-200 pt-16"
        >
          {/* Feature 1 */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: "#27272a", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)" }}
            className="p-6 rounded-lg border border-zinc-200 bg-white shadow-sm transition-all duration-300"
          >
            <div className="w-8 h-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-800 font-bold mb-4">
              01
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wide">XGBoost + Optuna Prediction</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Instant classification of student data based on statistical probabilities automatically tuned using Optuna hyperparameter tuning.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: "#27272a", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)" }}
            className="p-6 rounded-lg border border-zinc-200 bg-white shadow-sm transition-all duration-300"
          >
            <div className="w-8 h-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-800 font-bold mb-4">
              02
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wide">Explainable AI (SHAP)</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Full transparency in AI model decision making. Precision understanding of academic or payment factors that trigger risks.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: "#27272a", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)" }}
            className="p-6 rounded-lg border border-zinc-200 bg-white shadow-sm transition-all duration-300"
          >
            <div className="w-8 h-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-800 font-bold mb-4">
              03
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wide">Priority Actions</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Grouping students into High, Medium, and Low risk levels to determine the most efficient preventive steps.
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="border-t border-zinc-200 bg-zinc-100/50 py-8 text-center text-[10px] tracking-wider text-zinc-500 uppercase"
      >
        &copy; {new Date().getFullYear()} TRACIA AI. All rights reserved.
      </motion.footer>
    </div>
  );
}
