import express from "express";

import {
  register,
  login,
  getprofile,
  updateProfile,
  itemCount,
  addToDashboard,
  getDashboarditems,
  deleteDashboardItem,
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController.js";
import { submitReport } from "../controllers/reportConroller.js";
import { upload } from "../middlewares/upload.js";
import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();

userRouter.post("/signup", register);
userRouter.post("/login", login);
userRouter.post("/profile", authUser, getprofile);
userRouter.post("/dashboard/my", authUser, itemCount);
userRouter.post("/dashboard/add", authUser, addToDashboard);
userRouter.post("/dashboard/my-items", authUser, getDashboarditems);
userRouter.put(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfile
);
userRouter.delete("/dashboard/:id", authUser, deleteDashboardItem);
userRouter.post("/submit", authUser, upload.single("file"), submitReport);
// userRouter.get("/myreports", getMyReports);
// userRouter.get("/settings",authUser,updateProfile,upload.single("image"))

userRouter.post("/forgot-password", sendResetCode);
userRouter.post("/verify-otp", verifyResetCode);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
