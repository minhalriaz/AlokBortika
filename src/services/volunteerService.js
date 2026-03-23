import api from "../api/api";

const volunteerService = {
  async getDashboard() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await api.post("/volunteer/dashboard", {
        userId: user.id,
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load dashboard",
      };
    }
  },

  async getProfile() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await api.post("/volunteer/profile", {
        userId: user.id,
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load profile",
      };
    }
  },

  async updateProfile(profileData) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await api.put("/volunteer/profile", {
        userId: user.id,
        name: profileData.name,
        bio: profileData.bio,
        skills: profileData.skills,
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  },

  async uploadProfilePicture(file) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", user.id);

      const response = await api.post("/volunteer/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload profile picture",
      };
    }
  },

  async assignProblem(problemId) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await api.post(`/volunteer/assign/${problemId}`, {
        userId: user.id,
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to assign problem",
      };
    }
  },

  async markDone(problemId) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await api.post(`/volunteer/done/${problemId}`, {
        userId: user.id,
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to mark done",
      };
    }
  },
};

export default volunteerService;