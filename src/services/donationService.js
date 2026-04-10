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

  async initPayment(donationData) {
    try {
      const response = await api.post("/donations/init-payment", donationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  },
};

export default donationService;