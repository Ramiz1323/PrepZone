import api from './api';

const getRevisionItems = async () => {
  return await api.get('/revision');
};

const addRevisionItem = async (data) => {
  return await api.post('/revision', data);
};

const updateRevisionItem = async (id, data) => {
  return await api.patch(`/revision/${id}`, data);
};

const deleteRevisionItem = async (id) => {
  return await api.delete(`/revision/${id}`);
};

export const revisionService = {
  getRevisionItems,
  addRevisionItem,
  updateRevisionItem,
  deleteRevisionItem,
};
