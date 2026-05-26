import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Download, ArrowLeft } from 'lucide-react';

export default function QuizResultsSummary({ result, onBack }) {
  if (!result) return null;

  const handleDownloadPDF = () => {
    window.print();
  };

  const percentage = Math.round((result.score / result.total_score) * 100) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-4 w-full"
    >
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.2)]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-50 mb-2 tracking-tight">Assessment Complete</h1>
            <p className="text-slate-300 font-medium text-lg">Here is your performance breakdown.</p>
          </div>
          
          <div className={`
            px-8 py-6 rounded-3xl border flex flex-col items-center justify-center min-w-[200px]
            ${percentage >= 80 ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-emerald-400' : 
              percentage >= 60 ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-amber-400' :
              'bg-red-500/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-red-400'
            }
          `}>
            <span className="text-sm font-black uppercase tracking-widest mb-1 opacity-80">Total Score</span>
            <span className="text-5xl font-black drop-shadow-md">{percentage}%</span>
            <span className="text-sm font-bold mt-2 opacity-80">{result.score} / {result.total_score} Correct</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-10 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all border border-white/10"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-full font-bold transition-all border border-indigo-500/30 ml-auto"
          >
            <Download size={18} />
            Download Summary PDF
          </button>
        </div>

        {/* Questions Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-50 mb-6 flex items-center gap-3">
            Question Breakdown
          </h2>
          
          {result.feedback && result.feedback.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                p-6 md:p-8 rounded-[32px] border relative overflow-hidden transition-all
                ${item.is_correct 
                  ? 'bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                  : 'bg-red-900/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}
              `}
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 ${item.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}></div>

              <div className="relative z-10 flex gap-4 md:gap-6">
                <div className="mt-1 shrink-0">
                  {item.is_correct 
                    ? <CheckCircle2 size={32} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> 
                    : <XCircle size={32} className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                </div>
                
                <div className="w-full">
                  <h3 className="text-lg md:text-xl font-bold text-slate-50 mb-4">{idx + 1}. {item.question_text}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Your Answer</span>
                      <p className={`font-bold text-lg ${item.is_correct ? 'text-emerald-300' : 'text-red-300'}`}>
                        {item.student_answer || "No answer provided"}
                      </p>
                    </div>
                    
                    {!item.is_correct && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                        <span className="text-xs font-black text-emerald-500/70 uppercase tracking-widest block mb-2">Correct Answer</span>
                        <p className="font-bold text-lg text-emerald-400">
                          {item.correct_answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .bg-slate-900\\/60 { background: white !important; border: none !important; box-shadow: none !important; }
          .text-slate-50, .text-slate-300, .text-slate-400 { color: black !important; }
          .bg-emerald-500\\/20, .bg-red-500\\/20, .bg-amber-500\\/20 { background: #f3f4f6 !important; border: 1px solid #d1d5db !important; }
          .text-emerald-400 { color: #059669 !important; }
          .text-red-400, .text-red-300 { color: #dc2626 !important; }
          .bg-emerald-900\\/10, .bg-red-900\\/10 { background: #f9fafb !important; }
          .shadow-\\[0_0_40px_rgba\\(79\\,70\\,229\\,0\\.2\\)\\] { box-shadow: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
