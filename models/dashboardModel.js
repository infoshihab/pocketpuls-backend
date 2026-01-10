import mongoose, { mongo } from "mongoose";
import User from "./userModel.js";

const dashboardItem = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  summary: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "income",
      "health&food",
      "rent",
      "utility",
      "expense",
      "recivable",
      "payable",
      "other",
    ],
    default: "income",
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
});

export default mongoose.model("DashboardItem", dashboardItem);
