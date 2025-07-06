import Interview from '../models/Interview.js'
import User from '../models/User.js'
import { auth } from "../config/firebase.js"

import Redis from 'ioredis';
import JSONCache from 'redis-json';

const redis = new Redis("rediss://default:AXbHAAIjcDFlYjQwZDJiYjg3ZDY0ZGE3OWQ3MzczNGFhNmQzMTIwOXAxMA@kind-anemone-30407.upstash.io:6379");

const jsonCache = new JSONCache(redis)

class InterviewsController {
  static async searchInterviews(req, res) {
    try {
      const { query, limit = 7 } = req.query;

      if (!query || query.length < 2) {
        return res.json({ companies: [], roles: [] });
      }

      const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const [companies, roles] = await Promise.all([
        // Companies aggregation
        Interview.aggregate([
          {
            $match: {
              company: { $regex: searchRegex },
              status: 'published'
            }
          },
          {
            $group: {
              _id: '$company',
              count: { $sum: 1 },
              recentRoles: { $addToSet: '$role' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 0,
              name: '$_id',
              count: 1,
              recentRoles: { $slice: ['$recentRoles', 3] }
            }
          }
        ]),

        // Roles aggregation
        Interview.aggregate([
          {
            $match: {
              role: { $regex: searchRegex },
              status: 'published'
            }
          },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
              companies: { $addToSet: '$company' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 0,
              title: '$_id',
              count: 1,
              companies: { $slice: ['$companies', 3] }
            }
          }
        ])
      ]);

      res.json({ companies, roles });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        message: 'Error performing search',
        error: error.message
      });
    }
  }

  static async getTrendingInterviews(req, res) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let trendingInterviews = await Interview.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ["$likes", 2] }, // Likes have more weight
                "$comments"
              ]
            }
          }
        },
        {
          $sort: { trendingScore: -1 }
        },
        {
          $limit: 10
        }
      ]);

      // Convert ObjectId to string for proper mapping
      const authorIds = trendingInterviews.map((interview) => interview.authorId?.toString());


      // Fetch user avatars
      const users = await User.find(
        { uid: { $in: authorIds } },
        { uid: 1, photoURL: 1 }
      ).lean();


      // Create a map of user avatars
      const userAvatarMap = {};
      users.forEach((user) => {
        userAvatarMap[user.uid.toString()] = user.photoURL;
      });

      // Attach avatar URLs to interviews
      trendingInterviews = trendingInterviews.map((interview) => ({
        ...interview,
        authorAvatar: userAvatarMap[interview.authorId?.toString()] || null
      }));

      res.status(200).json(trendingInterviews);
    } catch (error) {
      console.error("Error fetching trending interviews:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }


  static async getInterviews(req, res) {
    try {
      const { company, role, level, tags } = req.query;
      const cacheKey = `interviews:${company || "all"}:${role || "all"}:${level || "all"}:${tags || "all"}`;

      // 🔹 Check if data exists in cache
      // const cachedData = await jsonCache.get(cacheKey);
      // if (cachedData) {
      //   return res.status(200).json(cachedData);
      // }

      // 🔹 If not cached, fetch from database
      let filter = { status: "published" };

      if (company) filter.company = new RegExp(company, "i");
      if (role) filter.role = new RegExp(role, "i");
      if (level) filter.level = new RegExp(level, "i");
      if (tags) filter.tags = { $in: tags.split(",") };

      let interviews = await Interview.find(filter)
        .select("company role level tags authorId createdAt likes views authorName comments")
        .sort({ createdAt: -1 })
        .lean();

      const authorIds = interviews.map((interview) => interview.authorId);
      const users = await User.find({ uid: { $in: authorIds } }, { uid: 1, photoURL: 1 }).lean();

      const userAvatarMap = {};
      users.forEach((user) => {
        userAvatarMap[user.uid] = user.photoURL;
      });

      interviews = interviews.map((interview) => ({
        ...interview,
        authorAvatar: userAvatarMap[interview.authorId]
      }));

      // 🔹 Store result in cache with 10-minute expiration
      // await jsonCache.set(cacheKey, interviews);
      // await redis.expire(cacheKey, 600); // 600 seconds (10 minutes)

      res.status(200).json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }


  static async userInterviews(req, res) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const token = authHeader.split("Bearer ")[1]
      const decodedToken = await auth.verifyIdToken(token)

      // Get user from Firebase
      const userRecord = await auth.getUser(decodedToken.uid)

      // Check if user exists in MongoDB
      let user = await User.findOne({ uid: userRecord.uid })
      const interviews = await Interview.find({ authorId: user.uid }).sort({ createdAt: -1 })

      return res.status(200).json(interviews)
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving the profile',
        error: error.message || 'Unknown error'
      });
    }
  }
  static async interviewById(req, res) {
    try {
      const { id } = req.params;
      let interview = await Interview.findById(id).lean(); //  Convert to plain JS object

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      //  Fetch user avatar using authorId
      const user = await User.findOne({ uid: interview.authorId }, { photoURL: 1 }).lean();
      const authorAvatar = user?.photoURL || "https://cdn.example.com/default-avatar.png";


      interview = { ...interview, authorAvatar };

      await Interview.findByIdAndUpdate(id, { $inc: { views: 1 } });

      // if (jsonCache.get('123') !== null)
      //   await jsonCache.set('123', interview)

      // client.get('123', "Vinay Sagar")

      return res.status(200).json(interview);
    } catch (error) {
      console.error("Get interview error:", error);
      return res.status(500).json({ message: "Failed to fetch interview" });
    }
  }

  static async createInterview(req, res) {
    try {
      // Verify authentication
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const token = authHeader.split("Bearer ")[1]
      const decodedToken = await auth.verifyIdToken(token)
      const userId = decodedToken.uid

      // Get user from MongoDB
      const user = await User.findOne({ uid: userId })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      const { company, role, level, questions, experience, tags, isAnonymous, tips } = req.body

      // Validate required fields
      if (!company || !role || !level || !questions || !experience || !tags) {
        return res.status(400).json({
          message: "Missing required fields",
          details: {
            company: !company,
            role: !role,
            level: !level,
            questions: !questions,
            experience: !experience,
            tags: !tags
          }
        })
      }

      // Ensure `questions` is correctly structured
      if (!Array.isArray(questions) || !questions.every(q => q.question && q.answer)) {
        return res.status(400).json({
          message: "Invalid questions format. Each question must have a 'question' and 'answer' field.",
          received: questions
        })
      }

      // Create new interview document
      const newInterview = new Interview({
        company,
        role,
        level,
        questions: questions.map(q => ({
          question: q.question.trim(),
          answer: q.answer.trim()
        })),
        experience: experience.trim(),
        tags: tags.map(tag => tag.trim()),
        tips: tips?.trim() || '', // Handle optional tips field
        isAnonymous,
        authorId: userId,
        authorName: isAnonymous ? "Anonymous" : user.displayName,
        createdAt: new Date(),
        likes: 0,
        views: 0,
        comments: 0,
        likedBy: []
      })

      // Save the interview
      const savedInterview = await newInterview.save()

      // Return success response with created interview
      return res.status(201).json({
        message: "Interview created successfully",
        interview: savedInterview
      })

    } catch (error) {
      console.error("Create interview error:", error)

      // Handle specific MongoDB validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {})
        })
      }

      // Handle other errors
      return res.status(500).json({
        message: "Failed to create interview",
        error: error.message
      })
    }
  }
  static async likeInterview(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      const { id } = req.params;
      const interview = await Interview.findById(id);

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      if (interview.likedBy.includes(userId)) {

        interview.likes -= 1;
        interview.likedBy = interview.likedBy.filter((uid) => uid !== userId);
      } else {
        interview.likes += 1;
        interview.likedBy.push(userId);
      }

      await interview.save();
      return res.status(200).json({ message: "Like updated", likes: interview.likes });
    } catch (error) {
      console.error("Like error:", error);
      return res.status(500).json({ message: "Failed to update like" });
    }
  }


  static async deleteInterview(req, res) {
    try {
      // Verify authentication
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const token = authHeader.split("Bearer ")[1]
      const decodedToken = await auth.verifyIdToken(token)
      const userId = decodedToken.uid

      const { id } = req.params
      const interview = await Interview.findById(id)

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" })
      }

      // Check if user is the author
      if (interview.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this interview" })
      }

      await Interview.findByIdAndDelete(id)

      return res.status(200).json({ message: "Interview deleted successfully" })
    } catch (error) {
      console.error("Delete interview error:", error)
      return res.status(500).json({ message: "Failed to delete interview" })
    }
  }

  // Preference for male and female
  static async updateInterview(req, res) {
    try {
      // Verify authentication
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const token = authHeader.split("Bearer ")[1]
      const decodedToken = await auth.verifyIdToken(token)
      const userId = decodedToken.uid

      const { id } = req.params
      const interview = await Interview.findById(id)

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" })
      }

      // Check if user is the author
      if (interview.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this interview" })
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      }

      const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true })

      return res.status(200).json(updatedInterview)
    } catch (error) {
      console.error("Update interview error:", error)
      return res.status(500).json({ message: "Failed to update interview" })
    }

  }
}

export default InterviewsController;
