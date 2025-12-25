
const API_BASE_URL = import.meta.env.VITE_API_URL;


// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Stringify body if it exists and is not already a string
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw new Error(error.message || 'API request failed');
  }
};

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const data: LoginData = { email, password };
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register: async (name: string, email: string, password: string, phone?: string, role = 'user') => {
    const data: RegisterData = { name, email, password, phone, role };
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyOTP: async (email: string, otp: string) => {
    const data = { email, otp };
    return apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (email: string) => {
    const data = { email };
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const data = { email, otp, newPassword };
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  activateAdmin: async () => {
    return apiRequest('/api/admin/activate', {
      method: 'POST',
    });
  }
};

// Cars API
export const carsAPI = {
  getAll: () => apiRequest('/api/cars'),
  
  getById: (id: string) => apiRequest(`/api/cars/${id}`),
  
  create: (carData: any) => apiRequest('/api/cars', {
    method: 'POST',
    body: JSON.stringify(carData),
  }),
  
  update: (id: string, carData: any) => apiRequest(`/api/cars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(carData),
  }),
  
  delete: (id: string) => apiRequest(`/api/cars/${id}`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData) => {
    return apiRequest("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },
  getAll: async () => {
    return apiRequest("/api/bookings");
  },
  getByUserId: async (userId: string) => {
    return apiRequest(`/api/bookings/user/${userId}`);
  },
  getById: async (id) => {
    return apiRequest(`/api/bookings/${id}`);
  },
  update: async (id, bookingData) => {
    return apiRequest(`/api/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    });
  },
  delete: async (id) => {
    return apiRequest(`/api/bookings/${id}`, {
      method: "DELETE",
    });
  },
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/api/users'),

  update: (id: string, userData: any) => apiRequest(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Notifications API
export const notificationsAPI = {
  getByUserId: (userId: string) => apiRequest(`/api/notifications/${userId}`),

  create: (notificationData: any) => apiRequest('/api/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  }),

  markAsRead: (id: string) => apiRequest(`/api/notifications/${id}/read`, {
    method: 'PUT',
  }),
};
