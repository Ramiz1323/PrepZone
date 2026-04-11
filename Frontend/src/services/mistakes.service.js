import api from './api';

const getMistakes = async () => {
  return await api.get('/mistakes');
};

const addMistake = async (data) => {
  return await api.post('/mistakes', data);
};

const deleteMistake = async (id) => {
  return await api.delete(`/mistakes/${id}`);
};

export const mistakesService = {
  getMistakes,
  addMistake,
  deleteMistake,
};
