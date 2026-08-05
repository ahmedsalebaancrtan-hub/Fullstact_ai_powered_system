import api from './axios';

const unwrapData = (response, fallback = []) => response.data?.data ?? fallback;

export const fetchClasses = async () => {
  const response = await api.get('/api/classes');
  return unwrapData(response);
};

export const createClassTargetedQuiz = async ({ title, description, schoolId, classId }) => {
  const response = await api.post('/api/quizzes', {
    title,
    description,
    school_id: Number(schoolId),
    class_id: Number(classId),
  });
  return unwrapData(response, null);
};

export const publishQuiz = async (quizId) => {
  const response = await api.put(`/api/quizzes/${quizId}/publish`, {
    status: 'PUBLISHED',
  });
  return response.data;
};

export const fetchTeacherQuizzes = async () => {
  const response = await api.get('/api/quizzes');
  return unwrapData(response);
};

export const fetchStudentQuizzes = async () => {
  const response = await api.get('/api/student/quizzes');
  return unwrapData(response);
};

export const fetchQuiz = async (quizId) => {
  const response = await api.get(`/api/quiz/${quizId}`);
  return unwrapData(response, null);
};
