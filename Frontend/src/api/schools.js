import api from './axios';

const unwrapData = (response, fallback = []) => response.data?.data ?? fallback;

const normalizeSchoolFromClass = (classRecord) => {
  const school = classRecord?.school ?? classRecord?.School;
  const schoolId = classRecord?.school_id ?? classRecord?.SchoolID;

  if (school) {
    return {
      ...school,
      id: school.id ?? school.ID ?? schoolId,
      name: school.name ?? school.Name,
    };
  }

  if (!schoolId) return null;

  return {
    id: schoolId,
    name: `School #${schoolId}`,
  };
};

const deriveSchoolsFromClasses = (classes) => {
  const byId = new Map();

  classes.forEach((classRecord) => {
    const school = normalizeSchoolFromClass(classRecord);
    if (!school?.id) return;

    const schoolId = String(school.id);
    const existing = byId.get(schoolId) || {
      ...school,
      classes: [],
    };

    existing.classes = [...existing.classes, classRecord];
    byId.set(schoolId, existing);
  });

  return Array.from(byId.values());
};

export const fetchSchools = async () => {
  try {
    const response = await api.get('/api/schools');
    return unwrapData(response);
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    const classes = await fetchClasses();
    return deriveSchoolsFromClasses(classes);
  }
};

export const createSchool = async ({ name, code, address, adminContactEmail }) => {
  const payload = { name, code, address, admin_contact_email: adminContactEmail };

  try {
    const response = await api.post('/api/schools', payload);
    return unwrapData(response, null);
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    const response = await api.post('/api/admin/schools', payload);
    return unwrapData(response, null);
  }
};

export const fetchClasses = async () => {
  const response = await api.get('/api/classes');
  return unwrapData(response);
};

export const createClass = async ({ name, schoolId }) => {
  const payload = {
    name,
    school_id: Number(schoolId),
  };

  try {
    const response = await api.post('/api/classes', payload);
    return unwrapData(response, null);
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    const response = await api.post('/api/admin/classes', payload);
    return unwrapData(response, null);
  }
};
