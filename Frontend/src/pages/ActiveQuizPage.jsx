import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  Loader2,
  Sparkles,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import useQuizStore from '../store/useQuizStore';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import QuizResultsSummary from '../components/QuizResultsSummary';

export default function ActiveQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, isLoading, fetchQuizById, error } = useQuizStore();
  const user = useAuthStore(state => state.user);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    if (!currentQuiz || currentQuiz.id !== parseInt(id)) {
      fetchQuizById(id);
    }
  }, [id, currentQuiz, fetchQuizById]);

  useEffect(() => {
    if (examStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  const handleStartExam = () => {
    const minutes = currentQuiz?.time_limit_minutes || 30;
    setTimeLeft(minutes * 60);
    setExamStarted(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting exam automatically...");

    try {
      const response = await api.post(`/api/quiz/${id}/submit`, { answers: userAnswers });
      toast.success("Exam submitted successfully!", { id: loadingToast });
      setSubmissionResult(response.data.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("You have already completed this assessment.", { id: loadingToast });
        navigate('/dashboard');
      } else {
        toast.error("Failed to submit score", { id: loadingToast });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your exam? You cannot undo this action.")) return;
    handleAutoSubmit();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
        <div className="text-center">
          <p className="text-slate-50 font-black text-xl">Loading Assessment</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuiz || !currentQuiz.questions) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <h2 className="text-3xl font-black text-slate-50">Quiz Not Found</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (submissionResult) {
    return <QuizResultsSummary result={submissionResult} onBack={() => navigate('/dashboard')} />;
  }

  if (!examStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-20 px-4 w-full"
      >
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[40px] p-10 border border-indigo-500/30 text-center shadow-[0_0_30px_rgba(79,70,229,0.2)]">
          <h1 className="text-4xl font-black text-slate-50 mb-4">{currentQuiz.title}</h1>
          <p className="text-slate-300 font-medium mb-8">You are about to start a timed assessment. Ensure you have a stable connection.</p>
          
          <div className="flex justify-center gap-8 mb-10">
            <div className="flex items-center gap-3 text-indigo-300">
              <Clock size={24} className="drop-shadow-[0_0_5px_rgba(165,180,252,0.8)]" />
              <span className="text-xl font-bold">{currentQuiz.time_limit_minutes || 30} Minutes</span>
            </div>
            <div className="flex items-center gap-3 text-purple-300">
              <CheckCircle2 size={24} />
              <span className="text-xl font-bold">{currentQuiz.questions.length} Questions</span>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl rounded-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/10 hover:scale-[1.02] transition-transform"
          >
            <Play size={24} className="fill-current" />
            <span>Start Exam Now</span>
          </button>
        </div>
      </motion.div>
    );
  }

  const questions = currentQuiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  
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

  const selectedOption = userAnswers[currentQuestionIndex] || null;

  const handleOptionSelect = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: option
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-0">
      {/* Sticky Countdown Timer */}
      <div className="sticky top-4 z-50 flex justify-center mb-10">
        <div className="flex items-center gap-3 px-6 py-3 bg-red-500/20 text-red-100 backdrop-blur-md border border-red-500/30 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <Clock size={20} className="animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-2xl font-black tracking-widest">{timeLeft !== null ? formatTime(timeLeft) : '00:00'}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <h1 className="text-2xl font-black text-slate-50 tracking-tight">{currentQuiz.title}</h1>
        <div className="text-left md:text-right flex flex-col md:items-end">
          <div className="flex items-center gap-2 text-sm font-black text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-4 py-1.5 rounded-full mb-3">
            <Sparkles size={14} />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-8">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${((Object.keys(userAnswers).length) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-900/60 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-indigo-500/30 min-h-[500px] flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex-grow space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 leading-tight">
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className="space-y-4">
            {String(currentQuestion.question_type).replace(/\s/g, '').toLowerCase() === 'shortanswer' ? (
              <div className="space-y-6">
                <input 
                  type="text"
                  value={selectedOption || ''}
                  onChange={(e) => handleOptionSelect(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-6 rounded-3xl border border-white/10 bg-slate-800/50 text-slate-50 font-bold text-xl focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      className={`
                        w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center justify-between group
                        ${isSelected 
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                          : 'border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-white/10'}
                      `}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`
                          w-8 h-8 rounded-[12px] border flex items-center justify-center transition-all shrink-0
                          ${isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600 bg-transparent text-slate-400'}
                        `}>
                          <span className="text-sm font-black">{String.fromCharCode(65 + idx)}</span>
                        </div>
                        <span className={`text-lg font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-300'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-between relative z-10">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-black transition-all ${
              currentQuestionIndex === 0 ? 'opacity-0 cursor-default' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              {isSubmitting ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle2 size={22} />}
              Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              Next Question
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
