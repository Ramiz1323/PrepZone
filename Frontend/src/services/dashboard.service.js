import api from './api';

const getSummary = async () => {
  return await api.get('/analytics/summary');
};

const getWeekly = async (days = 7) => {
  return await api.get(`/analytics/weekly?days=${days}`);
};

const getSuggestions = async () => {
  return await api.get('/analytics/suggestions');
};

export const dashboardService = {
  getSummary,
  getWeekly,
  getSuggestions,
  getCalendar: async (year) => {
    return await api.get(`/analytics/calendar${year ? `?year=${year}` : ''}`);
  },
};
