import Reports from "../models/reports.js";
import cloudinary from "../config/cloudinary.js";

const submitReport = async (req, res) => {
  try {
    const { description, contact } = req.body;
    let imageUrl = "";
    if (!description || !contact) {
      return res.status(400).json({ success: false, message: "Missing Field" });
    }

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "reports",
      });
      imageUrl = upload.secure_url;
    }
    const newReport = new Reports({
      user: req.user._id,
      message: description,
      image: imageUrl,
      contact,
    });

    await newReport.save();
    res.status(201).json({
      success: true,
      message: "Report Submitted Successfully",
      data: newReport,
    });
  } catch (error) {
    console.error("Submit Report Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// const getMyReports = async (req, res) => {
//   try {
//     const reports = await Reports.find({ username: req.user._id }).sort({
//       createdAt: -1,
//     });
//     res.json({ success: true, reports });
//   } catch (error) {
//     console.error("Get Reports Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export { submitReport };
