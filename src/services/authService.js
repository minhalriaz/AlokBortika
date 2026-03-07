import api from "../api/api";

const authService = {
  async register(userData) {
    try {
      const response = await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return {
        success: true,
        message: response.data.message || "Signup successful",
        user: response.data.user,
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

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return {
        success: true,
        message: response.data.message || "Login successful",
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

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true };
  },

  getUserFromStorage() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async getCurrentUser() {
    const user = this.getUserFromStorage();

    if (!user) {
      return { success: false, message: "No user found" };
    }

    return { success: true, user };
  },

  async checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
      return { success: false, message: "No token found" };
    }

    return { success: true };
  },

  async sendVerifyOtp() {
    return { success: false, message: "Not implemented yet" };
  },

  async verifyEmail() {
    return { success: false, message: "Not implemented yet" };
  },

  async sendResetOtp() {
    return { success: false, message: "Not implemented yet" };
  },

  async resetPassword() {
    return { success: false, message: "Not implemented yet" };
  },

  isLoggedIn() {
    return !!localStorage.getItem("token");
  },
};

export default authService;