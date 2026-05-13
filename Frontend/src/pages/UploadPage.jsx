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
  const { isLoading, setIsLoading, setCurrentQuiz, addRecentQuiz, setError } = useQuizStore();

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

    setIsLoading(true);
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
        
        if (user?.role === 'TEACHER' || user?.Role === 'TEACHER') {
          navigate(`/exam-editor/${quizData.id}`);
        } else {
          navigate(`/quiz-view/${quizData.id}`);
        }
      } else {
        throw new Error(quizResp.data.message || "Failed to generate quiz.");
      }
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message || "AI is busy, please try again in a few seconds.";
      toast.error(backendError, { id: loadingToast });
      setError(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto w-full"
    >
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create AI Assessment</h1>
        <p className="text-gray-500 mt-2 text-lg">Input your lecture notes or study material to generate pedagogical questions.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Document Info */}
        <div className="flex-1 space-y-6 w-full">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Study Material</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Quiz Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Quantum Physics"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/5 focus:border-[#1e3a8a] transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Course Content / Notes</label>
                <textarea 
                  rows="12"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste your textbook chapters, lecture transcripts, or summaries here..."
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e3a8a]/5 focus:border-[#1e3a8a] transition-all resize-none text-lg leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Settings */}
        <div className="w-full lg:w-[420px] space-y-6 shrink-0">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 sticky top-28">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#F8C2A0] flex items-center justify-center">
                <Settings size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AI Configuration</h2>
            </div>

            <div className="space-y-10">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-5 uppercase tracking-wider">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-200">
                  {['Easy', 'Medium', 'Hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-3 text-sm font-bold rounded-xl transition-all ${
                        difficulty === level 
                          ? 'bg-white text-[#1e3a8a] shadow-md shadow-blue-100 scale-105' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-5 uppercase tracking-wider">Assessment Style</label>
                <div className="space-y-3">
                  {['Multiple Choice', 'True/False', 'Short Answer'].map((type) => (
                    <label key={type} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={questionTypes.includes(type)}
                          onChange={() => toggleQuestionType(type)}
                        />
                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          questionTypes.includes(type) ? 'bg-[#1e3a8a] border-[#1e3a8a]' : 'border-gray-300 bg-white'
                        }`}>
                          {questionTypes.includes(type) && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <span className="text-md font-bold text-gray-700">{type}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">No. of Questions</label>
                  <span className="text-lg font-black text-[#1e3a8a] bg-blue-50 px-4 py-1.5 rounded-xl">{numQuestions}</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#1e3a8a]"
                />
                <div className="flex justify-between mt-3 text-[12px] font-black text-gray-400">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-5 bg-[#F8C2A0] text-gray-900 font-black text-lg rounded-2xl flex items-center justify-center gap-4 hover:bg-[#f7b58c] transition-all shadow-xl shadow-[#F8C2A0]/30 transform hover:-translate-y-1 active:translate-y-0 mt-8 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={24} className="group-hover:fill-current" />
                <span>Generate Assessment</span>
              </button>
            </div>

            <div className="mt-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
              <Info size={24} className="text-[#1e3a8a] shrink-0" />
              <p className="text-[13px] text-blue-900 leading-relaxed font-bold">
                Gemini 3 will analyze your material to create high-standard pedagogical assessments.
              </p>
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
