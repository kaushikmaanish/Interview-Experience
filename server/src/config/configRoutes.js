import allRoutes from "../routes/allRoutes.js";

const configRoutes = (app) => {
  // Config routes here with error checking
  if (allRoutes.authRoutes) app.use("/api/auth", allRoutes.authRoutes);
  if (allRoutes.interviewRoutes) app.use("/api/interviews", allRoutes.interviewRoutes);
  if (allRoutes.userRoutes) app.use("/api/users", allRoutes.userRoutes);
  if (allRoutes.chatRoutes) app.use("/api/chat", allRoutes.chatRoutes);
  if (allRoutes.commentsRoutes) app.use("/api/comments", allRoutes.commentsRoutes);
  if (allRoutes.adminRoutes) app.use("/api/admin", allRoutes.adminRoutes);
};

export default configRoutes;
