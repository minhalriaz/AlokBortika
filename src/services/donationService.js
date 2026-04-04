import api from "../api/api";

const donationService = {
  async createDonation(donationData) {
    try {
      const response = await api.post("/donations", donationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  async getDonationStats() {
    try {
      const response = await api.get("/donations/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  async createCheckoutSession(donationData) {
    try {
      const response = await api.post("/donations/checkout-session", donationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  async verifyCheckoutSession(sessionId) {
    try {
      const response = await api.post("/donations/verify-session", { sessionId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },
};

export default donationService;
