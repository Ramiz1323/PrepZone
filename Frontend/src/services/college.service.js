import api from './api';

const collegeService = {
  /**
   * Fetch all colleges from the backend
   * @returns {Promise<Array>} List of colleges
   */
  getColleges: async () => {
    try {
      const response = await api.get('/colleges');
      return response.data; // response.data is the 'data' field from the body {success, message, data}
    } catch (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }
  }
};

export default collegeService;
