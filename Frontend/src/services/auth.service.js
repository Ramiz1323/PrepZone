import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const updateGoal = async (goal) => {
  const response = await api.patch('/auth/goal', { dailyMCQGoal: goal });
  return response.data;
};

const updateTargetColleges = async (colleges) => {
  const response = await api.patch('/auth/target-colleges', { targetColleges: colleges });
  return response.data;
};

export const authService = {
  login,
  register,
  logout,
  getMe,
  updateGoal,
  updateTargetColleges,
};
