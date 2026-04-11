import api from './api';

const getLogs = async () => {
  return await api.get('/tracker');
};

const submitLog = async (data) => {
  return await api.post('/tracker', data);
};

export const trackerService = {
  getLogs,
  submitLog,
};
