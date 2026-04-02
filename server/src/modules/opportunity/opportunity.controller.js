import Opportunity from "../../models/Opportunity.js";
import User from "../../models/user.js";

// Get all opportunities
export const getAllOpportunities = async (req, res) => {
  try {
    const { limit = 100, status = "active" } = req.query;
    const opportunities = await Opportunity.find({ status })
      .populate("createdBy", "name email")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: opportunities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single opportunity
export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create opportunity (admin only)
export const createOpportunity = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create opportunities",
      });
    }

    const {
      title,
      description,
      category,
      organization,
      location,
      duration,
      spots,
      themeColor,
      requirements,
      benefits,
      image,
      imageUrl,
    } = req.body;

    const opportunity = new Opportunity({
      title,
      description,
      category,
      organization,
      location,
      duration,
      spots,
      themeColor,
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements?.split("\n").filter(Boolean) || [],
      benefits: Array.isArray(benefits)
        ? benefits
        : benefits?.split("\n").filter(Boolean) || [],
      image: image || imageUrl,
      imageUrl: image || imageUrl,
      createdBy: userId,
    });

    await opportunity.save();

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update opportunity (admin only)
export const updateOpportunity = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update opportunities",
      });
    }

    const {
      title,
      description,
      category,
      organization,
      location,
      duration,
      spots,
      themeColor,
      requirements,
      benefits,
      image,
      imageUrl,
      status,
    } = req.body;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        organization,
        location,
        duration,
        spots,
        themeColor,
        requirements: Array.isArray(requirements)
          ? requirements
          : requirements?.split("\n").filter(Boolean) || [],
        benefits: Array.isArray(benefits)
          ? benefits
          : benefits?.split("\n").filter(Boolean) || [],
        image: image || imageUrl,
        imageUrl: image || imageUrl,
        status,
      },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      data: opportunity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete opportunity (admin only)
export const deleteOpportunity = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete opportunities",
      });
    }

    const opportunity = await Opportunity.findByIdAndDelete(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
