import userRoutes from "./userRoutes.js";
import interviewsRoutes from "./interviewsRoutes.js";
import commentsRoutes from "./commentsRoutes.js";
import authRoutes from "./authRoutes.js";
import chatRoutes from "./chatRoutes.js";
import adminRoutes from "./adminRoutes.js";

const allRoutes = {
  chatRoutes,
  userRoutes,
  commentsRoutes,        // Changed from CommentsRoutes to commentsRoutes
  interviewRoutes: interviewsRoutes,  // Added alias to match configRoutes usage
  authRoutes,
  adminRoutes,
}

export default allRoutes;
