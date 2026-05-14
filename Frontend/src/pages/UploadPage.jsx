import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Settings, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Info,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useQuizStore from '../store/useQuizStore';
import useAuthStore from '../store/useAuthStore';

export default function UploadPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { isLoading, setLoading, setCurrentQuiz, addRecentQuiz, setError } = useQuizStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionTypes, setQuestionTypes] = useState(['Multiple Choice']);
  const [numQuestions, setNumQuestions] = useState(5);

  const toggleQuestionType = (type) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim() || !notes.trim()) {
      toast.error("Please provide both a title and study notes.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("AI is designing your assessment...");

    try {
      // Step A: Save Material
      const materialResp = await api.post('/api/material', {
        file_name: title,
        content: notes
      });

      const materialId = materialResp.data.data.id;

      // Map question types to backend expectation
      const qTypeMapping = {
        'Multiple Choice': 'MCQ',
        'True/False': 'TrueFalse',
        'Short Answer': 'ShortAnswer'
      };
      
      const qTypeStr = questionTypes.map(t => qTypeMapping[t]).join(', ');

      const payload = {
        title: title,
        material_id: materialId,
        difficulty: difficulty,
        question_type: qTypeStr,
        num_questions: numQuestions
      };

      // Step B: Trigger AI Generation
      const quizResp = await api.post('/api/quiz/generate', payload);

      if (quizResp.data.is_success) {
        const quizData = quizResp.data.data;
        setCurrentQuiz(quizData);
        addRecentQuiz(quizData);
        
        toast.success("Quiz generated successfully!", { id: loadingToast });
        
        navigate(`/quiz-view/${quizData.id}`);
      } else {
        throw new Error(quizResp.data.message || "Failed to generate quiz.");
      }
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message || "AI is busy, please try again in a few seconds.";
      toast.error(backendError, { id: loadingToast });
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-160px)]"
    >
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create AI Assessment</h1>
        <p className="text-gray-500 mt-3 text-lg font-medium">Input your lecture notes or study material to generate pedagogical questions.</p>
      </div>

      <div className="bg-[#0a0f1e] rounded-[40px] shadow-2xl border border-gray-800 overflow-hidden flex-1 flex flex-col relative">
        {/* Background Ambience similar to Login */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Scrollable Inner Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative z-10">
          <div className="space-y-10">
            
            {/* Topic / Title */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Assessment Topic</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Quantum Physics"
                className="w-full px-8 py-6 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-xl text-white placeholder:text-gray-600 font-medium"
              />
            </div>
            
            {/* Course Content / Notes */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Course Content</label>
              <textarea 
                rows="8"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your textbook chapters, lecture transcripts, or summaries here..."
                className="w-full px-8 py-6 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-xl text-white placeholder:text-gray-600 resize-y leading-relaxed font-medium"
              ></textarea>
            </div>

            {/* Difficulty Level Row */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Difficulty Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Easy', 'Medium', 'Hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-6 px-6 text-lg font-bold rounded-2xl transition-all border flex items-center justify-between ${
                      difficulty === level 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-900/20' 
                        : 'bg-slate-900/50 border-white/5 text-gray-500 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {level}
                    {difficulty === level && <CheckCircle2 size={24} className="text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Style Row */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Assessment Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Multiple Choice', 'True/False', 'Short Answer'].map((type) => (
                  <label key={type} className={`py-6 px-6 text-lg font-bold rounded-2xl transition-all border flex items-center justify-between cursor-pointer ${
                    questionTypes.includes(type)
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-slate-900/50 border-white/5 text-gray-500 hover:text-white hover:bg-slate-800/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={questionTypes.includes(type)}
                        onChange={() => toggleQuestionType(type)}
                      />
                      <span>{type}</span>
                    </div>
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      questionTypes.includes(type) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600 bg-transparent'
                    }`}>
                      {questionTypes.includes(type) && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-black text-white uppercase tracking-widest">Number of Questions</label>
                <span className="text-xl font-black text-[#F8C2A0] bg-orange-900/30 px-6 py-2 rounded-xl">{numQuestions}</span>
              </div>
              <div className="py-8 bg-slate-900/50 border border-white/5 rounded-2xl px-8">
                <input 
                  type="range"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#F8C2A0]"
                />
                <div className="flex justify-between mt-6 text-[13px] font-black text-gray-500 uppercase tracking-widest">
                  <span>1 Question</span>
                  <span>20 Questions</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 w-full">
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className={`relative z-50 w-full py-6 font-black text-xl rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl transform active:scale-95 group cursor-pointer ${
                  isLoading 
                    ? "bg-slate-800 text-gray-500 cursor-not-allowed opacity-80 shadow-none" 
                    : "bg-[#F8C2A0] text-[#1e3a8a] hover:bg-[#f7b58c] hover:scale-[1.02] shadow-[#F8C2A0]/20"
                }`}
              >
                {isLoading ? (
                  <Loader2 size={32} className="animate-spin text-[#F8C2A0]" />
                ) : (
                  <Zap size={32} className="group-hover:fill-current" />
                )}
                <span>{isLoading ? "Generating Quiz..." : "Start Quiz Now"}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Full-Screen Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="relative mb-12">
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.2, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-[#F8C2A0] rounded-full blur-3xl"
              ></motion.div>
              
              <div className="bg-white p-12 rounded-[40px] shadow-2xl relative z-10 border border-gray-100">
                <Loader2 size={64} className="text-[#1e3a8a] animate-spin" />
              </div>
            </div>
            
            <div className="max-w-md w-full text-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#1e3a8a]">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em]">Artificial Intelligence</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900">Designing Assessment</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  designing pedagogical questions based on your provided material. This usually takes 10-15 seconds.
                </p>
              </div>

              {/* Progress Bar Emulation */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                <motion.div 
                  initial={{ width: "5%" }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] rounded-full shadow-sm"
                />
              </div>
              <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                <span>Analyzing</span>
                <span>Generating</span>
                <span>Finalizing</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
