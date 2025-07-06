import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Compound index to prevent duplicate likes
LikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const Like = mongoose.model('Like', LikeSchema);

export default Like;
