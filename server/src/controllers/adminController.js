import Interview from "../models/Interview.js";
import User from "../models/User.js";
import crypto from "crypto";
import mongoose from "mongoose";

class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const [totalInterviews, activeUsers, pendingReviews, flaggedContent] = await Promise.all([
        Interview.countDocuments(),
        User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        Interview.countDocuments({ status: "pending" }),
        Interview.countDocuments({ "flags.0": { $exists: true } })
      ]);

      return res.json({ totalInterviews, activeUsers, pendingReviews, flaggedContent });
    } catch (error) {
      console.error("Error getting admin stats:", error);
      return res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  }

  static async getFlaggedInterviews(req, res) {
    try {
      const flaggedInterviews = await Interview.find({ "flags.0": { $exists: true } })
        .select("company role authorId authorName createdAt status flags")
        .sort({ createdAt: -1 });

      return res.json(flaggedInterviews);
    } catch (error) {
      console.error("Error getting flagged interviews:", error);
      return res.status(500).json({ message: "Failed to fetch flagged interviews" });
    }
  }

  static async getPendingInterviews(req, res) {
    try {
      const pendingInterviews = await Interview.find({ status: "pending" })
        .select("company role authorId authorName createdAt status")
        .sort({ createdAt: -1 });

      return res.json(pendingInterviews);
    } catch (error) {
      console.error("Error getting pending interviews:", error);
      return res.status(500).json({ message: "Failed to fetch pending interviews" });
    }
  }

  static async getInterviewDetails(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid interview ID format" });
      }

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      return res.json(interview);
    } catch (error) {
      console.error("Error getting interview details:", error);
      return res.status(500).json({ message: "Failed to fetch interview details" });
    }
  }

  static async approveInterview(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid interview ID format" });
      }

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      interview.flags = [];
      if (interview.status === "pending") {
        interview.status = "published";
        interview.publishedAt = new Date();
      }

      await interview.save();
      return res.json({ message: "Interview approved successfully" });
    } catch (error) {
      console.error("Error approving interview:", error);
      return res.status(500).json({ message: "Failed to approve interview" });
    }
  }

  static async rejectInterview(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid interview ID format" });
      }

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      interview.status = "rejected";
      await interview.save();
      return res.json({ message: "Interview rejected successfully" });
    } catch (error) {
      console.error("Error rejecting interview:", error);
      return res.status(500).json({ message: "Failed to reject interview" });
    }
  }

  static async deleteInterview(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid interview ID format" });
      }

      const interview = await Interview.findByIdAndDelete(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      return res.json({ message: "Interview deleted successfully" });
    } catch (error) {
      console.error("Error deleting interview:", error);
      return res.status(500).json({ message: "Failed to delete interview" });
    }
  }

  static async generateAdminKey(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const targetUser = await User.findOne({ email });

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate admin key
      const adminKey = crypto.randomBytes(32).toString('hex');

      // Update user with admin privileges
      targetUser.isAdmin = true;
      targetUser.adminKey = adminKey;
      await targetUser.save();

      res.json({ adminKey });
    } catch (error) {
      console.error('Error generating admin key:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default AdminController;
