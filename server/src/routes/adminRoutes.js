import { Router } from "express";
import adminController from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js"

const adminRoutes = Router();

// adminRoutes.use(adminAuth);

adminRoutes.get("/dashboard-stats", adminController.getDashboardStats);
adminRoutes.get("/flagged-interviews", adminController.getFlaggedInterviews);
adminRoutes.get("/pending-interviews", adminController.getPendingInterviews);
adminRoutes.get("/interview/:id", adminController.getInterviewDetails);
adminRoutes.post("/approve-interview/:id", adminController.approveInterview);
adminRoutes.post("/reject-interview/:id", adminController.rejectInterview);
adminRoutes.delete("/delete-interview/:id", adminController.deleteInterview);
adminRoutes.post("/generate-admin-key", adminController.generateAdminKey);

export default adminRoutes;
