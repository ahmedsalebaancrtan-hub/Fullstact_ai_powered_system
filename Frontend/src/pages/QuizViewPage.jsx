import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Info, 
  RefreshCcw,
  Trophy,
  Download,
  Loader2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import useQuizStore from '../store/useQuizStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useAuthStore from '../store/useAuthStore';

export default function QuizViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, isLoading, fetchQuizById, error } = useQuizStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!currentQuiz || currentQuiz.id !== parseInt(id)) {
      fetchQuizById(id);
    }
  }, [id, currentQuiz, fetchQuizById]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="w-14 h-14 text-indigo-400 animate-spin" />
        <div className="text-center">
          <p className="text-white font-black text-xl">Loading Assessment</p>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-[0.2em] text-[10px]">Designing your experience...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuiz || !currentQuiz.questions) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <div className="h-24 w-24 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-8">
          <Info className="w-12 h-12 text-red-400 opacity-80" />
        </div>
        <h2 className="text-3xl font-black text-white">Quiz Not Found</h2>
        <p className="text-slate-400 mt-4 max-w-md mx-auto text-lg leading-relaxed">
          {error || "We couldn't find the questions for this quiz. It may have been deleted or the link is invalid."}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-10 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-95 border border-white/5"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const questions = currentQuiz.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleDownloadPDF = async () => {
    if (!currentQuiz) return;
    setIsGeneratingPDF(true);
    const loadingToast = toast.loading("Generating PDF report...");
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString();
      const accuracy = Math.round((score / questions.length) * 100);

      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138);
      doc.text("Academic AI Assessment Report", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Exam: ${currentQuiz.title}`, 14, 32);
      doc.text(`Student: ${user?.FullName || user?.name || "Academic User"}`, 14, 38);
      doc.text(`Date: ${timestamp}`, 14, 44);

      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Result']],
        body: [
          ['Total Questions', questions.length.toString()],
          ['Correct Answers', score.toString()],
          ['Accuracy Percentage', `${accuracy}%`],
          ['Difficulty Level', currentQuiz.difficulty || 'Medium']
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] }
      });

      const tableData = userAnswers.map((ua, index) => [
        index + 1,
        ua.question,
        ua.selected,
        ua.correct,
        ua.isCorrect ? "CORRECT" : "INCORRECT"
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Status']],
        body: tableData,
        columnStyles: {
          1: { cellWidth: 80 },
          4: { fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            if (data.cell.raw === 'CORRECT') {
              data.cell.styles.textColor = [16, 185, 129];
            } else {
              data.cell.styles.textColor = [244, 63, 94];
            }
          }
        }
      });

      doc.save(`${currentQuiz.title.replace(/\s+/g, '_')}_Report.pdf`);
      toast.success("Assessment report saved!", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to generate PDF.", { id: loadingToast });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  let options = [];
  if (currentQuestion) {
    if (Array.isArray(currentQuestion.options)) {
      options = currentQuestion.options;
    } else if (typeof currentQuestion.options === 'string') {
      try {
        options = JSON.parse(currentQuestion.options);
      } catch (e) {
        options = [];
      }
    }
  }

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswered) return;
    
    const isCorrect = selectedOption === currentQuestion.correct_answer;
    if (isCorrect) setScore(prev => prev + 1);
    
    setIsAnswered(true);
    setUserAnswers([...userAnswers, {
      question: currentQuestion.question_text,
      selected: selectedOption,
      correct: currentQuestion.correct_answer,
      isCorrect
    }]);

    if (isCorrect) {
      toast.success("Correct Answer!", { icon: '👏' });
    } else {
      toast.error("Incorrect. Let's learn from this.", { icon: '💡' });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      toast.success("Assessment Completed!", { icon: '🏆' });
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto py-12 px-6 w-full"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-10 md:p-16 shadow-2xl border border-slate-800/80 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10 relative z-10">
            <Trophy className="w-12 h-12 text-indigo-400" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight relative z-10">Assessment Complete</h2>
          <p className="text-slate-400 font-medium mb-12 text-lg relative z-10">Excellent effort! Here's your pedagogical performance summary.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative z-10">
            <div className="p-8 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <span className="block text-4xl font-black text-white mb-1">{score} <span className="text-xl text-slate-500">/ {questions.length}</span></span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Score</span>
            </div>
            <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-600/20 border border-white/5">
              <span className="block text-4xl font-black text-white mb-1">{percentage}%</span>
              <span className="text-xs font-black text-indigo-200 uppercase tracking-widest">Accuracy Rate</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-950/40 border border-slate-800/80 text-slate-300 rounded-xl font-black hover:bg-slate-900/60 hover:text-white transition-all active:scale-95"
            >
              <RefreshCcw size={20} />
              Retake Quiz
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-black transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20 border border-white/5"
            >
              <Download size={20} />
              Download Report
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 text-slate-500 font-bold hover:text-indigo-400 transition-colors relative z-10"
          >
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-0">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-xs font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest mb-3"
          >
            <ChevronLeft size={14} className="mr-1" />
            Exit Assessment
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight">{currentQuiz.title}</h1>
        </div>
        <div className="text-left md:text-right flex flex-col md:items-end">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-3">
            <Sparkles size={12} />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <div className="w-full md:w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-800/80 min-h-[500px] flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px]"></div>
        <div className="flex-grow space-y-10 relative z-10">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Knowledge Check</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className="space-y-4">
            {String(currentQuestion.question_type).replace(/\s/g, '').toLowerCase() === 'shortanswer' ? (
              <div className="space-y-6">
                <input 
                  type="text"
                  value={selectedOption || ''}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={isAnswered}
                  placeholder="Type your answer here..."
                  className="w-full p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-white font-bold text-lg focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                />
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-4"
                  >
                    <div className="h-9 w-9 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-0.5">Correct Answer</p>
                      <p className="font-bold text-base text-white">{currentQuestion.correct_answer}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = isAnswered && option === currentQuestion.correct_answer;
                  const isWrong = isAnswered && isSelected && option !== currentQuestion.correct_answer;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswered}
                      className={`
                        w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group
                        ${isSelected && !isCorrect && !isWrong
                          ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                          : 'border-slate-800/80 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-900/40'}
                        ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''}
                        ${isWrong ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-8 h-8 rounded-lg border flex items-center justify-center transition-all shrink-0
                          ${isSelected && !isCorrect && !isWrong ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}
                          ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : ''}
                          ${isWrong ? 'border-red-500 bg-red-500 text-white' : ''}
                        `}>
                          <span className="text-xs font-black">{String.fromCharCode(65 + idx)}</span>
                        </div>
                        <span className={`text-base font-bold ${
                          isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : isSelected ? 'text-indigo-300' : 'text-slate-300'
                        }`}>
                          {option}
                        </span>
                      </div>
                      
                      <AnimatePresence>
                        {isCorrect && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                          </motion.div>
                        )}
                        {isWrong && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
                            <XCircle size={20} className="text-red-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 flex justify-end relative z-10">
          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || (typeof selectedOption === 'string' && selectedOption.trim() === '')}
              className={`
                flex items-center gap-3 px-10 py-4 rounded-xl font-black text-base transition-all border
                ${selectedOption 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 border-white/5' 
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-600 cursor-not-allowed'}
              `}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-black text-base transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 border border-white/5"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Assessment' : 'Continue'}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Explanation Block */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 bg-amber-500/10 rounded-2xl p-7 border border-amber-500/20"
          >
            <div className="flex items-start gap-5">
              <div className="h-10 w-10 bg-amber-500/20 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Info size={20} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-black text-amber-400 text-xs uppercase tracking-[0.3em] mb-2">Pedagogical Insight</h4>
                <p className="text-amber-200/80 font-medium text-base leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
