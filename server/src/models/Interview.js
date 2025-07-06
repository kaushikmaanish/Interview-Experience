import mongoose from "mongoose"

const interviewSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
    enum: ["internship", "fresher", "experienced"],
  },
  questions: [
    {
      question: { type: String, required: false },
      answer: { type: String, required: false },
    }
  ],
  experience: {
    type: String,
    required: true,
  },
  tips: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    required: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "pending", "published", "rejected", "flagged"],
    default: "pending",
  },
  flags: [
    {
      reason: { type: String, required: true },
      reportedBy: { type: String, required: true },
      date: { type: Date, default: Date.now },
    }
  ],
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likedBy: { type: [String], default: [] },
})

export default mongoose.model("Interview", interviewSchema)
