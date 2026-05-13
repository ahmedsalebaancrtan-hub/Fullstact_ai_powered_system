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
        <Loader2 className="w-16 h-16 text-[#1e3a8a] animate-spin" />
        <div className="text-center">
          <p className="text-gray-900 font-black text-xl">Loading Assessment</p>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-[0.2em] text-[10px]">Designing your experience...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuiz || !currentQuiz.questions) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <div className="h-24 w-24 bg-red-50 rounded-[32px] flex items-center justify-center mb-8">
          <Info className="w-12 h-12 text-red-500 opacity-50" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Quiz Not Found</h2>
        <p className="text-gray-500 mt-4 max-w-md mx-auto text-lg leading-relaxed">
          {error || "We couldn't find the questions for this quiz. It may have been deleted or the link is invalid."}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-10 px-10 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95"
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
        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-2xl border border-gray-100 text-center">
          <div className="w-32 h-32 bg-blue-50 rounded-[48px] flex items-center justify-center mx-auto mb-10 transform rotate-3">
            <Trophy className="w-16 h-16 text-[#1e3a8a]" />
          </div>
          
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Assessment Complete</h2>
          <p className="text-gray-500 font-medium mb-12 text-lg">Excellent effort! Here's your pedagogical performance summary.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
              <span className="block text-4xl font-black text-gray-900 mb-1">{score} <span className="text-xl text-gray-400">/ {questions.length}</span></span>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Score</span>
            </div>
            <div className="p-8 bg-[#1e3a8a] rounded-[32px] shadow-xl shadow-blue-900/20">
              <span className="block text-4xl font-black text-white mb-1">{percentage}%</span>
              <span className="text-xs font-black text-blue-200 uppercase tracking-widest">Accuracy Rate</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-[#F8C2A0] text-gray-900 rounded-[24px] font-black hover:bg-[#f7b58c] transition-all shadow-xl shadow-[#F8C2A0]/20 active:scale-95"
            >
              <RefreshCcw size={22} />
              Retake Quiz
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-gray-100 text-gray-900 rounded-[24px] font-black hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={22} />
              Download Report
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 text-gray-400 font-bold hover:text-[#1e3a8a] transition-colors"
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
            className="flex items-center text-xs font-black text-gray-400 hover:text-[#1e3a8a] transition-colors uppercase tracking-widest mb-3"
          >
            <ChevronLeft size={14} className="mr-1" />
            Exit Assessment
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentQuiz.title}</h1>
        </div>
        <div className="text-left md:text-right flex flex-col md:items-end">
          <div className="flex items-center gap-2 text-sm font-black text-[#1e3a8a] bg-blue-50 px-4 py-1.5 rounded-full mb-3">
            <Sparkles size={14} />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <div className="w-full md:w-48 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              className="h-full bg-[#1e3a8a]"
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
        className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-gray-100 min-h-[500px] flex flex-col relative overflow-hidden"
      >
        <div className="flex-grow space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Knowledge Check</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
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
                  className="w-full p-6 rounded-3xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-bold text-xl focus:bg-white focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-inner"
                />
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-[24px] bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-center gap-4"
                  >
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Correct Answer</p>
                      <p className="font-bold text-lg">{currentQuestion.correct_answer}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
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
                        w-full text-left p-6 rounded-[24px] border-2 transition-all duration-300 flex items-center justify-between group
                        ${isSelected 
                          ? 'border-[#1e3a8a] bg-blue-50 shadow-lg shadow-blue-100/50' 
                          : 'border-gray-50 hover:border-blue-200 bg-gray-50 hover:bg-white'}
                        ${isCorrect ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100/50 ring-2 ring-emerald-500' : ''}
                        ${isWrong ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100/50 ring-2 ring-red-500' : ''}
                      `}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`
                          w-8 h-8 rounded-[12px] border-2 flex items-center justify-center transition-all shrink-0
                          ${isSelected ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white' : 'border-gray-200 bg-white text-gray-400'}
                          ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : ''}
                          ${isWrong ? 'border-red-500 bg-red-500 text-white' : ''}
                        `}>
                          <span className="text-sm font-black">{String.fromCharCode(65 + idx)}</span>
                        </div>
                        <span className={`text-lg font-bold ${isSelected || isCorrect || isWrong ? 'text-gray-900' : 'text-gray-600'}`}>
                          {option}
                        </span>
                      </div>
                      
                      <AnimatePresence>
                        {isCorrect && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
                            <CheckCircle2 size={24} className="text-emerald-500" />
                          </motion.div>
                        )}
                        {isWrong && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
                            <XCircle size={24} className="text-red-500" />
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
        <div className="mt-12 flex justify-end">
          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || (typeof selectedOption === 'string' && selectedOption.trim() === '')}
              className={`
                flex items-center gap-3 px-12 py-5 rounded-[24px] font-black text-lg transition-all
                ${selectedOption 
                  ? 'bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-2xl shadow-blue-900/30 transform hover:-translate-y-1 active:translate-y-0' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-12 py-5 bg-[#1e3a8a] text-white rounded-[24px] font-black text-lg hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/30 transform hover:-translate-y-1 active:translate-y-0"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Assessment' : 'Continue'}
              <ChevronRight size={22} />
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
            className="mt-8 bg-orange-50 rounded-[32px] p-8 border border-orange-100 shadow-lg shadow-orange-100/30"
          >
            <div className="flex items-start gap-5">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Info size={24} className="text-orange-600" />
              </div>
              <div>
                <h4 className="font-black text-orange-900 text-xs uppercase tracking-[0.3em] mb-2">Pedagogical Insight</h4>
                <p className="text-orange-800 font-medium text-lg leading-relaxed">
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
