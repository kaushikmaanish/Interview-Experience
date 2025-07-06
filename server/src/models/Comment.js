import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true
  },
  authorId: {
    type: String,
    required: true,
    index: true
  },
  author: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    initials: {
      type: String,
      default: function () {
        // Generate initials from name if not provided
        return this.author.name
          .split(' ')
          .map(part => part.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
    }
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String,
    ref: 'User',
    default: []
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isAuthor: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret._id = ret._id.toString();
      // Convert createdAt to a string format matching the frontend
      ret.createdAt = ret.createdAt.toISOString();
      ret.updatedAt = ret.updatedAt.toISOString();
      // Remove fields not needed in client
      delete ret.__v;
      return ret;
    }
  }
});

// Index to optimize fetching comments for a specific interview
CommentSchema.index({ interviewId: 1, createdAt: -1 });

// Index to optimize fetching replies for a specific comment
CommentSchema.index({ parentCommentId: 1, createdAt: 1 });

// Virtual property to get nested replies
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId'
});

// Method to check if a user can edit or delete a comment
CommentSchema.methods.canModify = function (userId) {
  return this.authorId === userId;
};

// Static method to get comments with pagination
CommentSchema.statics.getInterviewComments = async function (interviewId, options = {}) {
  const { limit = 50, skip = 0, includeReplies = true } = options;

  // Get top-level comments
  const query = {
    interviewId,
    parentCommentId: null,
    isDeleted: false
  };

  let comments = await this.find(query)
    .sort({ createdAt: -1 }) // Most recent first
    .skip(skip)
    .limit(limit);

  if (includeReplies) {
    // Get replies for each comment
    const commentIds = comments.map(c => c._id);
    const replies = await this.find({
      parentCommentId: { $in: commentIds },
      isDeleted: false
    }).sort({ createdAt: 1 });

    // Create a map for O(1) access to replies
    const repliesMap = {};
    replies.forEach(reply => {
      if (!repliesMap[reply.parentCommentId]) {
        repliesMap[reply.parentCommentId] = [];
      }
      repliesMap[reply.parentCommentId].push(reply);
    });

    // Add replies to their parent comments
    comments = comments.map(comment => {
      comment = comment.toObject({ virtuals: true });
      comment.replies = repliesMap[comment._id] || [];
      return comment;
    });
  }

  return comments;
};

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
