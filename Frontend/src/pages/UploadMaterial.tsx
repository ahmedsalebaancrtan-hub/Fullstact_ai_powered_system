import React, { useState, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Settings, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Info,
  Sparkles,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useQuizStore from '../store/useQuizStore';
import useAuthStore from '../store/useAuthStore';

const UploadMaterial: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state: any) => state.user);
  const { isLoading, setLoading, setCurrentQuiz, addRecentQuiz, setError } = useQuizStore() as any;

  const [title, setTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['Multiple Choice']);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [status, setStatus] = useState<string>('PUBLISHED');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      if (!title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setTitle(cleanName);
      }
      toast.success(`PDF selected: ${selectedFile.name}`);
    } else {
      toast.error("Please upload a valid PDF document.");
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const toggleQuestionType = (type: string) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim() || !file) {
      toast.error("Please provide both a title and a study PDF.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("AI is designing your assessment...");

    try {
      const qTypeMapping: Record<string, string> = {
        'Multiple Choice': 'MCQ',
        'True/False': 'TrueFalse',
        'Short Answer': 'ShortAnswer'
      };
      
      const qTypeStr = questionTypes.map(t => qTypeMapping[t]).join(', ');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('difficulty', difficulty);
      formData.append('question_type', qTypeStr);
      formData.append('num_questions', numQuestions.toString());
      formData.append('time_limit', timeLimit.toString());
      formData.append('status', status);

      const quizResp = await api.post('/api/quiz/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (quizResp.data.is_success) {
        const quizData = quizResp.data.data;
        setCurrentQuiz(quizData);
        addRecentQuiz(quizData);
        
        toast.success(status === 'PUBLISHED' ? "Quiz Successfully Published!" : "Quiz Saved as Draft!", { id: loadingToast });
        
        navigate('/dashboard');
      } else {
        throw new Error(quizResp.data.message || "Failed to generate quiz.");
      }
    } catch (err: any) {
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message || "AI is busy, please try again in a few seconds.";
      toast.error(backendError, { id: loadingToast });
      setError(backendError);
    } finally {
      setLoading(false);
      setShowConfigModal(false);
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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative z-10">
          <div className="space-y-10">
            
            {/* Topic / Title */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Assessment Topic</label>
              <input 
                type="text"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Quantum Physics"
                className="w-full px-8 py-6 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-xl text-white placeholder:text-gray-600 font-medium"
              />
            </div>
            
            {/* Course Content / PDF Upload Dropzone */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Study Material (PDF)</label>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${
                  dragActive 
                    ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.25)] scale-[1.01]' 
                    : file
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                }`}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                <input 
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {!file ? (
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-6 relative z-10 w-full text-center">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                      <UploadCloud size={38} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-white tracking-tight">Drag & drop your study PDF here</p>
                      <p className="text-gray-500 text-sm font-medium">Or <span className="text-indigo-400 underline decoration-2">browse files</span> on your device</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                      <Info size={12} className="text-indigo-400" />
                      Strictly accepts PDF up to 25MB
                    </div>
                  </label>
                ) : (
                  <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <FileText size={38} />
                    </div>
                    <div className="space-y-2 w-full">
                      <p className="text-xl font-bold text-white truncate max-w-full px-4">{file.name}</p>
                      <p className="text-gray-400 text-sm font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                    </div>
                    <div className="flex gap-4 w-full justify-center">
                      <button 
                        onClick={() => setFile(null)}
                        className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm shadow-lg shadow-red-950/20"
                      >
                        <Trash2 size={16} />
                        Remove File
                      </button>
                      <label 
                        htmlFor="pdf-upload"
                        className="cursor-pointer px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 transition-all text-sm"
                      >
                        Change File
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Level Row */}
            <div className="space-y-4 w-full">
              <label className="block text-sm font-black text-white uppercase tracking-widest px-1">Difficulty Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Easy', 'Medium', 'Hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNumQuestions(parseInt(e.target.value))}
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
                type="button"
                onClick={() => {
                  if (!title.trim() || !file) {
                    toast.error("Please provide both a title and a study PDF.");
                    return;
                  }
                  setShowConfigModal(true);
                }}
                disabled={isLoading}
                className={`relative z-50 w-full py-6 font-black text-xl rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl transform active:scale-95 group cursor-pointer ${
                  isLoading 
                    ? "bg-slate-800 text-gray-500 cursor-not-allowed opacity-80 shadow-none" 
                    : "bg-[#F8C2A0] text-[#1e3a8a] hover:bg-[#f7b58c] hover:scale-[1.02] shadow-[#F8C2A0]/20"
                }`}
              >
                <Zap size={32} className="group-hover:fill-current" />
                <span>Configure & Generate</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#020617]/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <Settings className="text-indigo-400" size={28} />
                <h3 className="text-2xl font-black text-white">Quiz Configuration</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Time Limit (Minutes)</label>
                  <input 
                    type="number"
                    min="1"
                    value={timeLimit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setStatus('PUBLISHED')}
                      className={`py-3 px-4 rounded-xl font-bold transition-all border ${
                        status === 'PUBLISHED' 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Publish Now
                    </button>
                    <button 
                      type="button"
                      onClick={() => setStatus('DRAFT')}
                      className={`py-3 px-4 rounded-xl font-bold transition-all border ${
                        status === 'DRAFT' 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Save as Draft
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 py-4 bg-white/5 text-gray-300 rounded-xl font-bold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleGenerate}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
                  >
                    <span>Generate</span>
                    <Zap size={18} className="fill-current" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default UploadMaterial;
