import api from '../api/api';

const authService = {
  // Register/Signup
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        name: userData.fullName, // Map fullName to name for backend
        email: userData.email,
        password: userData.password
      });
      
      if (response.data.success) {
        // Store user data in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Login
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Get current user from backend
  async getCurrentUser() {
    try {
      const response = await api.post('/auth/me');
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Check if authenticated
  async checkAuth() {
    try {
      const response = await api.post('/auth/is-auth');
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },

  // Send verification OTP
  async sendVerifyOtp() {
    try {
      const response = await api.post('/auth/sent-verify-otp');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Verify email with OTP
  async verifyEmail(otp) {
    try {
      const response = await api.post('/auth/verify-account', { otp });
      if (response.data.success) {
        // Update user in localStorage
        const user = this.getUserFromStorage();
        if (user) {
          user.isAccountVerified = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Send password reset OTP
  async sendResetOtp(email) {
    try {
      const response = await api.post('/auth/send-reset-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Reset password with OTP
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  // Get user from localStorage
  getUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in (based on localStorage)
  isLoggedIn() {
    return !!localStorage.getItem('user');
  }
};

export default authService;