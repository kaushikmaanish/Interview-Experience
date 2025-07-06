import Interview from '../models/Interview.js';
import mongoose from 'mongoose';
import Comment from "../models/Comment.js";

class CommentsController {
  static async getComments(req, res) {
    try {
      const { interviewId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        return res.status(400).json({ message: "Invalid interview ID format" });
      }

      // Use the static method we defined in the schema
      const comments = await Comment.getInterviewComments(interviewId, {
        limit: Number(req.query.limit) || 50,
        skip: Number(req.query.skip) || 0
      });

      return res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: "Failed to fetch comments" });
    }
  }

  static async postComment(req, res) {
    try {
      const { interviewId, content, parentCommentId } = req.body;
      const user = req.user;

      if (!interviewId || !content) {
        return res.status(400).json({ message: "Interview ID and content are required" });
      }

      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        return res.status(400).json({ message: "Invalid interview ID format" });
      }

      if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res.status(400).json({ message: "Invalid parent comment ID format" });
      }

      // Get interview author ID to check if the comment author is the interview author
      let isAuthor = false;
      try {
        const interview = await mongoose.model('Interview').findById(interviewId);
        isAuthor = interview && interview.authorId === user.uid;
      } catch (err) {
        // Ignore error, isAuthor will remain false
        console.log("Error checking if user is author:", err);
      }

      // Create the comment
      const comment = new Comment({
        interviewId,
        authorId: user.uid,
        author: {
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '',
          // Generate initials automatically using the schema default function
        },
        content: content.trim(),
        parentCommentId: parentCommentId || null,
        isAuthor: isAuthor
      });

      await comment.save();
      await Interview.findByIdAndUpdate(interviewId, { $inc: { comments: 1 } });
      return res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ message: "Failed to create comment" });
    }
  }

  static async editComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.uid;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID format" });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Find the comment
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user is authorized to edit this comment
      if (!comment.canModify(userId)) {
        return res.status(403).json({ message: "You are not authorized to edit this comment" });
      }

      // Update the comment
      comment.content = content.trim();
      comment.isEdited = true;
      await comment.save();

      return res.json(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ message: "Failed to update comment" });
    }
  }

  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.uid;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID format" });
      }

      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user is authorized to delete this comment
      if (!comment.canModify(userId)) {
        return res.status(403).json({ message: "You are not authorized to delete this comment" });
      }

      // Soft delete the comment
      comment.isDeleted = true;
      await comment.save();

      // Ensure interviewId exists (assuming comment has an interview reference)
      if (comment.interviewId) {
        await Interview.findByIdAndUpdate(comment.interviewId, { $inc: { comments: -1 } });
      }

      return res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ message: "Failed to delete comment" });
    }
  }

  static async likeComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.uid;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID format" });
      }

      // Find the comment
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user has already liked this comment
      // if (comment.likedBy && comment.likedBy.includes(userId)) {
      //   return res.status(400).json({ message: "You've already liked this comment" });
      // }

      // Add the user to the likedBy array and increment the likes count
      if (comment.likedBy.includes(userId)) {
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter((uid) => uid !== userId);
      }
      else {
        comment.likes += 1;
        comment.likedBy.push(userId)
      }

      // comment.likes += 1;
      // if (!comment.likedBy) {
      //   comment.likedBy = [];
      // }
      // comment.likedBy.push(userId);

      await comment.save();

      return res.json({ likes: comment.likes });
    } catch (error) {
      console.error('Error liking comment:', error);
      return res.status(500).json({ message: "Failed to like comment" });
    }
  }


  static async dislikeComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.uid;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID format" });
      }

      // Find the comment
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user has liked this comment
      if (!comment.likedBy || !comment.likedBy.includes(userId)) {
        return res.status(400).json({ message: "You haven't liked this comment" });
      }

      // Remove the user from the likedBy array and decrement the likes count
      comment.likes = Math.max(0, comment.likes - 1); // Ensure likes doesn't go below 0
      comment.likedBy = comment.likedBy.filter(id => id !== userId);

      await comment.save();

      return res.json({ likes: comment.likes });
    } catch (error) {
      console.error('Error unliking comment:', error);
      return res.status(500).json({ message: "Failed to unlike comment" });
    }
  }

  // Preference for male and female
  static async getReplies(req, res) {
    try {
      const { commentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID format" });
      }

      const replies = await Comment.find({
        parentCommentId: commentId,
        isDeleted: false
      }).sort({ createdAt: 1 });

      return res.json(replies);
    } catch (error) {
      console.error('Error fetching replies:', error);
      return res.status(500).json({ message: "Failed to fetch replies" });
    }
  }
}

export default CommentsController;
