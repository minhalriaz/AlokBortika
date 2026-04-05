import api from "../api/api";

const USER_KEY = "user";
const TOKEN_KEY = "token";

const persistAuth = (user, token) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearAuth = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

const authService = {
  async register(userData) {
    try {
      const response = await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || "volunteer",
      });

      if (response.data.success) {
        persistAuth(response.data.user, response.data.token);
      }

      return {
        success: response.data.success,
        message: response.data.message,
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Signup failed",
      };
    }
  },

  async login(credentials) {
    try {
      const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data.success) {
        persistAuth(response.data.user, response.data.token);
      }

      return {
        success: response.data.success,
        message: response.data.message,
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Login failed",
      };
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuth();
    }

    return { success: true };
  },

  getUserFromStorage() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  getTokenFromStorage() {
    return localStorage.getItem(TOKEN_KEY);
  },

  async getCurrentUser() {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success && response.data.user) {
        persistAuth(response.data.user, response.data.token || this.getTokenFromStorage());
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch user",
      };
    }
  },

  async checkAuth() {
    try {
      const response = await api.get("/auth/is-auth");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Auth check failed",
      };
    }
  },

  async sendVerifyOtp() {
    try {
      const user = this.getUserFromStorage();
      const response = await api.post("/auth/send-verify-otp", {
        userId: user?.id,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP",
      };
    }
  },

  async verifyEmail(otp) {
    try {
      const user = this.getUserFromStorage();
      const response = await api.post("/auth/verify-account", {
        userId: user?.id,
        otp,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify email",
      };
    }
  },

  async sendResetOtp(email) {
    try {
      const response = await api.post("/auth/send-reset-otp", { email });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send reset OTP",
      };
    }
  },

  async resetPassword(email, otp, newPassword) {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reset password",
      };
    }
  },

  isLoggedIn() {
    return !!this.getTokenFromStorage() && !!this.getUserFromStorage();
  },
};

export default authService;
