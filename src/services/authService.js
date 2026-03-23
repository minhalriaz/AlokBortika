import api from "../api/api";

const authService = {
  async register(userData) {
    try {
      const response = await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || "volunteer",
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
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

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return {
        success: response.data.success,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user,
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return { success: true };
  },

  getUserFromStorage() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async getCurrentUser() {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
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
    return !!localStorage.getItem("user");
  },
};

export default authService;