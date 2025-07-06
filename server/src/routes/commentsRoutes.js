import { Router } from "express";
import CommentsController from "../controllers/commentsController.js";
import auth from "../middleware/firebase.js";
const CommentsRoutes = Router();

CommentsRoutes.get('/:interviewId', CommentsController.getComments)
CommentsRoutes.post('/', auth, CommentsController.postComment)
CommentsRoutes.put('/:commentId', auth, CommentsController.editComment)
CommentsRoutes.delete('/:commentId', auth, CommentsController.deleteComment)
CommentsRoutes.post('/:commentId/like', auth, CommentsController.likeComment)
CommentsRoutes.post('/:commentId/unlike', auth, CommentsController.dislikeComment)
CommentsRoutes.get('/:commentId/replies', CommentsController.getReplies)

export default CommentsRoutes;
