import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem('opd_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper for admin auth header
const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerUser = async (userData) => {
  const res = await axios.post(`${API_URL}/auth/register`, userData);
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

export const adminRegister = async (email, password, employeeId) => {
  const res = await axios.post(`${API_URL}/auth/admin/register`, { email, password, employeeId });
  return res.data;
};

export const adminLogin = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/admin/login`, { email, password });
  return res.data;
};

export const fetchPredictions = async (date, department) => {
  const res = await axios.get(`${API_URL}/predictions`, { 
    params: { date, department },
    headers: getAuthHeaders()
  });
  return res.data;
};

export const bookAppointment = async (date, department, timeSlot) => {
  const res = await axios.post(`${API_URL}/appointments`, 
    { date, department, timeSlot },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const fetchUserAppointments = async () => {
  const res = await axios.get(`${API_URL}/appointments`, { headers: getAuthHeaders() });
  return res.data;
};

export const cancelAppointment = async (id) => {
  const res = await axios.delete(`${API_URL}/appointments/${id}`, { headers: getAuthHeaders() });
  return res.data;
};

// Patient-side: check doctor availability
export const fetchDoctorStatus = async () => {
  const res = await axios.get(`${API_URL}/doctor-status`, { headers: getAuthHeaders() });
  return res.data;
};

// --- Admin APIs ---

export const fetchAllAppointments = async () => {
  const res = await axios.get(`${API_URL}/admin/appointments`, { headers: getAdminAuthHeaders() });
  return res.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const res = await axios.put(`${API_URL}/admin/appointments/${id}/status`, 
    { status }, 
    { headers: getAdminAuthHeaders() }
  );
  return res.data;
};

export const fetchAdminDoctorStatus = async () => {
  const res = await axios.get(`${API_URL}/admin/doctor-status`, { headers: getAdminAuthHeaders() });
  return res.data;
};

export const toggleDoctorAvailability = async (department, available) => {
  const res = await axios.put(`${API_URL}/admin/doctor-status/${encodeURIComponent(department)}`, 
    { available }, 
    { headers: getAdminAuthHeaders() }
  );
  return res.data;
};

export const transferAppointment = async (id, newDepartment) => {
  const res = await axios.put(`${API_URL}/admin/appointments/${id}/transfer`, 
    { newDepartment }, 
    { headers: getAdminAuthHeaders() }
  );
  return res.data;
};

export const runNoShowCheck = async () => {
  const res = await axios.post(`${API_URL}/admin/no-show-check`, {}, { headers: getAdminAuthHeaders() });
  return res.data;
};
