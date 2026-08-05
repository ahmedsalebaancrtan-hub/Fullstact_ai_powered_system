import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  ChevronLeft,
  Settings,
  BookOpen,
  RefreshCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { publishQuiz } from '../api/quizzes';
import useQuizStore from '../store/useQuizStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExamEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, fetchQuizById, isLoading } = useQuizStore();
  
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentQuiz || currentQuiz.id !== parseInt(id)) {
      fetchQuizById(id);
    } else {
      const parsedQuestions = (currentQuiz.questions || []).map(q => {
        let opts = q.options;
        if (typeof opts === 'string') {
          try {
            opts = JSON.parse(opts);
          } catch (e) {
            opts = [];
          }
        }
        return { ...q, options: Array.isArray(opts) ? opts : [] };
      });
      
      setQuestions(parsedQuestions);
      setQuizTitle(currentQuiz.title);
    }
  }, [id, currentQuiz, fetchQuizById]);

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    const updatedOptions = [...updated[qIndex].options];
    updatedOptions[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: updatedOptions };
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      question_text: 'New Question',
      question_type: 'MCQ',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option A',
      explanation: 'Provide an explanation here.'
    }]);
    toast.success("New question added");
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success("Question removed");
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    const loadingToast = toast.loading(publish ? "Publishing exam..." : "Saving draft...");
    try {
      const payload = {
        title: quizTitle,
        questions: questions,
        status: publish ? 'PUBLISHED' : 'DRAFT'
      };
      
      const response = await api.put(`/api/quiz/${id}`, payload);
      if (response.data.is_success) {
        if (publish) {
          await publishQuiz(id);
        }
        toast.success(publish ? 'Exam published successfully!' : 'Changes saved as draft.', { id: loadingToast });
        if (publish) navigate('/dashboard');
      }
    } catch (err) {
      toast.error("Failed to save changes. Please try again.", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = (mode) => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString();

      doc.setFontSize(20);
      doc.text(quizTitle, 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Type: ${mode === 'student' ? 'Student Paper' : 'Teacher Key'}`, 14, 30);
      doc.text(`Date: ${timestamp}`, 14, 35);
      
      let currentY = 45;

      questions.forEach((q, idx) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0);
        const splitQ = doc.splitTextToSize(`${idx + 1}. ${q.question_text}`, 180);
        doc.text(splitQ, 14, currentY);
        currentY += (splitQ.length * 6);

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        q.options.forEach((opt, optIdx) => {
          const prefix = String.fromCharCode(65 + optIdx) + ")";
          doc.text(`${prefix} ${opt}`, 20, currentY);
          currentY += 6;
        });

        if (mode === 'teacher') {
          doc.setTextColor(30, 58, 138); // Blue-900
          doc.setFont(undefined, 'bold');
          doc.text(`Correct Answer: ${q.correct_answer}`, 14, currentY);
          currentY += 6;
          doc.setFont(undefined, 'normal');
          doc.setTextColor(100);
          const splitExp = doc.splitTextToSize(`Explanation: ${q.explanation}`, 170);
          doc.text(splitExp, 14, currentY);
          currentY += (splitExp.length * 5) + 5;
        } else {
          currentY += 5;
        }
        
        currentY += 5;
      });

      doc.save(`${quizTitle.replace(/\s+/g, '_')}_${mode}.pdf`);
      toast.success(`${mode === 'student' ? 'Student Paper' : 'Teacher Key'} exported!`);
    } catch (e) {
      toast.error("Failed to generate PDF.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-[#1e3a8a] animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Exam Editor</h1>
            <p className="text-gray-500 font-medium">Refine your AI-generated questions for pedagogical excellence.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => exportPDF('student')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              <FileText size={18} className="text-blue-600" />
              Student Paper
            </button>
            <div className="w-[1px] bg-gray-100 mx-1 my-2" />
            <button 
              onClick={() => exportPDF('teacher')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Settings size={18} className="text-orange-600" />
              Teacher Key
            </button>
          </div>
          
          <button 
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen size={20} />
            Publish Exam
          </button>
        </div>
      </div>

      <div className="space-y-8 pb-32">
        {questions.map((q, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm relative group hover:shadow-md transition-shadow"
          >
            <button 
              onClick={() => handleRemoveQuestion(idx)}
              className="absolute top-8 right-8 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={22} />
            </button>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Question {idx + 1}</label>
                <textarea 
                  value={q.question_text}
                  onChange={(e) => handleUpdateQuestion(idx, 'question_text', e.target.value)}
                  className="w-full p-6 bg-gray-50 border-none rounded-[24px] focus:ring-4 focus:ring-blue-50 transition-all text-xl font-bold text-gray-800 leading-relaxed"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Option {String.fromCharCode(65 + optIdx)}</label>
                    <input 
                      type="text"
                      value={opt}
                      onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-semibold text-gray-700"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                <div>
                  <label className="block text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 px-1">Correct Answer</label>
                  <select 
                    value={q.correct_answer}
                    onChange={(e) => handleUpdateQuestion(idx, 'correct_answer', e.target.value)}
                    className="w-full p-4 bg-emerald-50/50 text-emerald-900 border-none rounded-2xl focus:ring-4 focus:ring-emerald-100 transition-all font-black"
                  >
                    {q.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-3 px-1">Pedagogical Explanation</label>
                  <textarea 
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                    className="w-full p-4 bg-orange-50/50 text-orange-900 border-none rounded-2xl focus:ring-4 focus:ring-orange-100 transition-all text-sm font-medium leading-relaxed"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={handleAddQuestion}
          className="w-full py-10 border-4 border-dashed border-gray-100 rounded-[32px] text-gray-400 hover:text-[#1e3a8a] hover:border-blue-100 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-4 group"
        >
          <div className="p-5 bg-gray-50 rounded-full group-hover:bg-white group-hover:shadow-lg transition-all">
            <Plus size={32} />
          </div>
          <span className="font-black text-lg">Add Custom Question</span>
        </button>
      </div>

      <div className="fixed bottom-10 right-10 flex gap-4 z-50">
        <button 
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="px-10 py-4 bg-white text-gray-700 rounded-2xl font-black border border-gray-200 shadow-2xl hover:bg-gray-50 transition-all flex items-center gap-3 active:scale-95"
        >
          {isSaving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
          Save Draft
        </button>
      </div>
    </div>
  );
}

const Loader2 = ({ className, size }) => <RefreshCcw className={className} size={size} />;
