import Interview from "../models/Interview.js";
import User from "../models/User.js";

class UserController {
  // Fetch user profile with interview stats
  static async profile(req, res) {
    try {
      const userId = req.user.uid;

      // Get user from MongoDB
      const user = await User.findOne({ uid: userId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's interview stats
      const interviewCount = await Interview.countDocuments({ authorId: userId });
      const totalLikes = await Interview.aggregate([
        { $match: { authorId: userId } },
        { $group: { _id: null, total: { $sum: "$likes" } } },
      ]);
      const totalComments = await Interview.aggregate([
        { $match: { authorId: userId } },
        { $group: { _id: null, total: { $sum: "$comments" } } },
      ]);

      const stats = {
        interviewCount,
        totalLikes: totalLikes.length > 0 ? totalLikes[0].total : 0,
        totalComments: totalComments.length > 0 ? totalComments[0].total : 0,
        memberSince: user.createdAt,
      };

      return res.status(200).json({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        stats,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  }

  // Fetch interviews posted by the user
  static async interviews(req, res) {
    try {
      const userId = req.user.uid;

      const interviews = await Interview.find({ authorId: userId }).sort({ createdAt: -1 });

      return res.status(200).json({ interviews });
    } catch (error) {
      console.error("Get user interviews error:", error);
      return res.status(500).json({ message: "Failed to fetch interviews" });
    }
  }

  // Update profile details
  static async profile_update(req, res) {
    try {
      const userId = req.user.uid;
      const { displayName, bio } = req.body;

      // Update user in MongoDB
      const user = await User.findOneAndUpdate(
        { uid: userId },
        {
          displayName: displayName || req.user.displayName, // Use `req.user.displayName`
          bio,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  }

  // Get basic profile data
  static async profile_data(req, res) {
    return res.status(200).json({
      name: req.user.displayName, // Use `displayName` instead of `name`
      email: req.user.email,
      photoURL: req.user.photoURL,
    });
  }

  static async stats(req, res) {
    try {
      const userId = req.user.uid;

      // Count number of interviews posted by the user
      const interviewCount = await Interview.countDocuments({ authorId: userId });

      // Aggregate total likes from user's interviews
      const totalLikes = await Interview.aggregate([
        { $match: { authorId: userId } },
        { $group: { _id: null, total: { $sum: "$likes" } } },
      ]);

      // Aggregate total comments from user's interviews
      const totalComments = await Interview.aggregate([
        { $match: { authorId: userId } },
        { $group: { _id: null, total: { $sum: "$comments" } } },
      ]);

      // Fetch user to get the joining date
      const user = await User.findOne({ uid: userId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        interviewCount,
        totalLikes: totalLikes.length > 0 ? totalLikes[0].total : 0,
        totalComments: totalComments.length > 0 ? totalComments[0].total : 0,
        memberSince: user.createdAt,
      });

    } catch (error) {
      console.error("Fetch user stats error:", error);
      return res.status(500).json({ message: "Failed to fetch user stats" });
    }
  }

  static async latestUserPhotos(req, res) {
    try {
      const userPhotos = await User.find(
        { photoURL: { $ne: null, $ne: "" } }, // Only fetch users with valid photoURL
        { photoURL: 1, _id: 0 } // Select only photoURL, exclude _id
      )
        .sort({ createdAt: -1 }) // Sort by latest
        .limit(5); // Limit to 5 users

      return res.status(200).json({ userPhotos });
    } catch (error) {
      console.error("Error fetching latest user photos:", error);
      return res.status(500).json({ message: "Failed to fetch user photos" });
    }
  }
}

export default UserController;
