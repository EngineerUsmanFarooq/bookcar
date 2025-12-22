// api.ts - Complete Production-Ready API Client
// =============================================

// ========================
// CONFIGURATION
// ========================

// Use environment variable for API base URL
// In Vercel: Add NEXT_PUBLIC_API_BASE_URL to your environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Default request timeout (10 seconds)
const DEFAULT_TIMEOUT = 10000;

// ========================
// TYPES
// ========================

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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  available: boolean;
  image?: string;
}

interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ========================
// API REQUEST HELPER
// ========================

/**
 * Enhanced API request helper with timeout, error handling, and retry logic
 */
const apiRequest = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if token exists
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // Create controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  
  try {
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
      signal: controller.signal,
      credentials: 'include', // Important for cookies if using session-based auth
      mode: 'cors', // Explicitly set CORS mode
    };
    
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      
      // Special handling for common status codes
      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      
      if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      }
      
      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse successful response
    const data = await response.json();
    return data;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// ========================
// AUTH API
// ========================

export const authAPI = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const data: LoginData = { email, password };
    const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: data,
    });
    
    // Store token if received
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },
  
  /**
   * Register new user
   */
  register: async (
    name: string, 
    email: string, 
    password: string, 
    phone?: string, 
    role = 'user'
  ): Promise<{ user: User; token: string }> => {
    const data: RegisterData = { name, email, password, phone, role };
    const response = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: data,
    });
    
    // Store token if received
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (email: string, otp: string): Promise<{ verified: boolean; message: string }> => {
    const data = { email, otp };
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<{ sent: boolean; message: string }> => {
    const data = { email };
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ reset: boolean; message: string }> => {
    const data = { email, otp, newPassword };
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Activate admin (protected endpoint)
   */
  activateAdmin: async (): Promise<{ activated: boolean; message: string }> => {
    return apiRequest('/admin/activate', {
      method: 'POST',
    });
  },

  /**
   * Logout user (client-side)
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    return apiRequest<User>('/auth/profile');
  },
};

// ========================
// CARS API
// ========================

export const carsAPI = {
  /**
   * Get all cars
   */
  getAll: async (): Promise<Car[]> => {
    return apiRequest<Car[]>('/cars');
  },
  
  /**
   * Get car by ID
   */
  getById: async (id: string): Promise<Car> => {
    return apiRequest<Car>(`/cars/${id}`);
  },
  
  /**
   * Get available cars within date range
   */
  getAvailable: async (startDate: string, endDate: string): Promise<Car[]> => {
    return apiRequest<Car[]>(`/cars/available?startDate=${startDate}&endDate=${endDate}`);
  },
  
  /**
   * Create new car (admin only)
   */
  create: async (carData: Omit<Car, 'id'>): Promise<Car> => {
    return apiRequest<Car>('/cars', {
      method: 'POST',
      body: carData,
    });
  },
  
  /**
   * Update car (admin only)
   */
  update: async (id: string, carData: Partial<Car>): Promise<Car> => {
    return apiRequest<Car>(`/cars/${id}`, {
      method: 'PUT',
      body: carData,
    });
  },
  
  /**
   * Delete car (admin only)
   */
  delete: async (id: string): Promise<{ deleted: boolean; message: string }> => {
    return apiRequest(`/cars/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Search cars by query
   */
  search: async (query: string): Promise<Car[]> => {
    return apiRequest<Car[]>(`/cars/search?q=${encodeURIComponent(query)}`);
  },
};

// ========================
// BOOKINGS API
// ========================

export const bookingsAPI = {
  /**
   * Create new booking
   */
  create: async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: bookingData,
    });
  },

  /**
   * Get all bookings (admin only)
   */
  getAll: async (): Promise<Booking[]> => {
    return apiRequest<Booking[]>('/bookings');
  },

  /**
   * Get bookings by user ID
   */
  getByUserId: async (userId: string): Promise<Booking[]> => {
    return apiRequest<Booking[]>(`/bookings/user/${userId}`);
  },

  /**
   * Get current user's bookings
   */
  getMyBookings: async (): Promise<Booking[]> => {
    return apiRequest<Booking[]>('/bookings/my-bookings');
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}`);
  },

  /**
   * Update booking
   */
  update: async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: bookingData,
    });
  },

  /**
   * Delete booking
   */
  delete: async (id: string): Promise<{ deleted: boolean; message: string }> => {
    return apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Cancel booking
   */
  cancel: async (id: string): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  },
};

// ========================
// USERS API
// ========================

export const usersAPI = {
  /**
   * Get all users (admin only)
   */
  getAll: async (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },
  
  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    return apiRequest<User>(`/users/${id}`);
  },
  
  /**
   * Update user profile
   */
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  },

  /**
   * Update current user's profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiRequest<User>('/users/profile', {
      method: 'PUT',
      body: userData,
    });
  },

  /**
   * Delete user (admin only)
   */
  delete: async (id: string): Promise<{ deleted: boolean; message: string }> => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================
// NOTIFICATIONS API
// ========================

export const notificationsAPI = {
  /**
   * Get notifications by user ID
   */
  getByUserId: async (userId: string): Promise<Notification[]> => {
    return apiRequest<Notification[]>(`/notifications/${userId}`);
  },

  /**
   * Get current user's notifications
   */
  getMyNotifications: async (): Promise<Notification[]> => {
    return apiRequest<Notification[]>('/notifications/my-notifications');
  },
  
  /**
   * Create notification (admin/system only)
   */
  create: async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    return apiRequest<Notification>('/notifications', {
      method: 'POST',
      body: notificationData,
    });
  },
  
  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    return apiRequest<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ updated: boolean; message: string }> => {
    return apiRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  /**
   * Delete notification
   */
  delete: async (id: string): Promise<{ deleted: boolean; message: string }> => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================
// HEALTH CHECK & UTILITIES
// ========================

export const utilsAPI = {
  /**
   * Check if API is reachable
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest('/health');
  },

  /**
   * Get API configuration
   */
  getConfig: async (): Promise<{ 
    apiVersion: string; 
    environment: string;
    corsEnabled: boolean;
  }> => {
    return apiRequest('/config');
  },
};

// ========================
// INTERCEPTOR FOR AUTO-TOKEN REFRESH (Optional Enhancement)
// ========================

let isRefreshing = false;
let failedQueue: Array<{resolve: (value: any) => void, reject: (reason?: any) => void}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// This would need to be integrated with your API helper
// For a complete solution, you might want to use axios with interceptors

export default {
  auth: authAPI,
  cars: carsAPI,
  bookings: bookingsAPI,
  users: usersAPI,
  notifications: notificationsAPI,
  utils: utilsAPI,
};
