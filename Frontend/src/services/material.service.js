import api from './api';

export const materialService = {
  getMaterials: async (params = {}) => {
    const response = await api.get('/materials', { params });
    return response.data;
  },

  getMaterialById: async (id) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  uploadMaterial: async (formData, onUploadProgress) => {
    const response = await api.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  },
};
