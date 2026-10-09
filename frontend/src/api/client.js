import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('bookmg_token') || localStorage.getItem('bookmg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto logout on unauthenticated
      console.warn('API returned 401 Unauthorized');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/api/v1/auth/login', credentials),
  register: (data) => api.post('/api/v1/auth/register', data),
  getMe: () => api.get('/api/v1/auth/me'),
};

export const resourceApi = {
  getResources: (params) => api.get('/api/v1/resources', { params }),
  getResourceById: (id) => api.get(`/api/v1/resources/${id}`),
  createResource: (data) => api.post('/api/v1/resources', data),
  updateResource: (id, data) => api.put(`/api/v1/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/api/v1/resources/${id}`),
};

export const bookingApi = {
  createBooking: (data) => api.post('/api/v1/bookings', data),
  getBookingById: (id) => api.get(`/api/v1/bookings/${id}`),
  getMyBookings: () => api.get('/api/v1/bookings/my'),
  getResourceBookings: (resourceId, start, end) =>
    api.get(`/api/v1/bookings/resource/${resourceId}`, { params: { start, end } }),
  cancelBooking: (id) => api.delete(`/api/v1/bookings/${id}`),
  cancelSeries: (recurrenceGroupId) => api.delete(`/api/v1/bookings/series/${recurrenceGroupId}`),
  checkIn: (id) => api.post(`/api/v1/bookings/${id}/checkin`),
  getAvailability: (resourceId, date) =>
    api.get('/api/v1/bookings/availability', { params: { resourceId, date } }),
};

export const approvalApi = {
  getPending: () => api.get('/api/v1/approvals/pending'),
  approve: (id, note) => api.post(`/api/v1/approvals/${id}/approve`, { note }),
  reject: (id, note) => api.post(`/api/v1/approvals/${id}/reject`, { note }),
};

export const reportApi = {
  getUtilisationReport: (startDate, endDate) =>
    api.get('/api/v1/reports/utilisation', { params: { startDate, endDate } }),
};

export default api;
