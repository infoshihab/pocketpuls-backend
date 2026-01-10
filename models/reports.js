import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userdata",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  contact: {
    type: String,
    required: true,
  },
});

const Reports = mongoose.model("Reportdata", userSchema);

export default Reports;
