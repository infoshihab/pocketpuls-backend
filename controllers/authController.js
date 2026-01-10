import User from "../models/userModel.js";
import DashboardItem from "../models/dashboardModel.js";
import cloudinary from "../config/cloudinary.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";

const otpStore = {};

// Register
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      image: req.file
        ? (
            await cloudinary.uploader.upload(req.file.path, {
              folder: "profile_pics",
            })
          ).secure_url
        : undefined,
    });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile
const getprofile = async (req, res) => {
  try {
    const userData = await User.findById(req.user._id).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, current, newPass, confirm } = req.body;
    const imageFile = req.file;

    if (!firstName || !lastName || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;

    if (current && newPass && confirm) {
      const match = await bcrypt.compare(current, user.password);
      if (!match)
        return res
          .status(400)
          .json({ success: false, message: "Current password incorrect" });
      if (newPass !== confirm)
        return res
          .status(400)
          .json({ success: false, message: "New passwords do not match" });
      user.password = await bcrypt.hash(newPass, 10);
    }

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "profile_pics",
        overwrite: true,
      });
      user.image = upload.secure_url;
    }

    await user.save();
    res.json({ success: true, userData: user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Routes
const addToDashboard = async (req, res) => {
  try {
    const { summary, category, amount } = req.body;
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.json({ success: false, message: "User Not Found" });

    const newItem = new DashboardItem({
      userId: req.user._id,
      summary,
      category,
      amount,
    });
    await newItem.save();

    res.json({
      success: true,
      message: "Data added successfully",
      data: newItem,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const itemCount = async (req, res) => {
  try {
    const categoryTotal = await DashboardItem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, category: "$_id", totalAmount: 1, count: 1 } },
    ]);
    res.json({ success: true, data: categoryTotal });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getDashboarditems = async (req, res) => {
  try {
    const items = await DashboardItem.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDashboardItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await DashboardItem.findByIdAndDelete(id);
    if (!deletedItem)
      return res.status(404).json({ message: "Item Not Found" });
    res.json({ message: "Item Deleted Successfully", deletedItem });
  } catch (error) {
    console.error("Error Deleting Item:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // valid for 5 mins

    // Send email
    await transporter.sendMail({
      from: "pocketpulse0@gmail.com",
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is: ${otp}`,
    });

    res.json({ success: true, message: "Verification code sent to email" });
  } catch (error) {
    console.error("Send Reset Code Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP
const verifyResetCode = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP found" });
    }

    if (record.expires < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    delete otpStore[email];

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  register,
  login,
  getprofile,
  updateProfile,
  addToDashboard,
  itemCount,
  getDashboarditems,
  deleteDashboardItem,
  sendResetCode,
  verifyResetCode,
  resetPassword,
};
