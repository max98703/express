/* eslint no-undef: "off" */

const express = require("express");
const router = express.Router();
const { sendResponse } = require("../services/service");
const path = require("path");
const { APIError } = require('../utils/app-errors');
const UserLoginRepository = require("../db/repository/user-repository");
const { upload } = require("../db/db");
const { createObjectCsvWriter } = require("csv-writer");


const userRepository = new UserRepository();

router.post("/upload-profile-picture", upload, async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  const { file } = req;


  try {
    if (name || phone) {
      await userRepository.updateUserDetails({ name, phoneNumber: phone }, userId);
    }

    if (file) {
      await userRepository.updateProfilePicture(userId, file.filename);
    } else if (!name && !phone) {
      return sendResponse(res, 400, false, "No file uploaded");
    }

    sendResponse(res, 200, true, "Profile updated successfully");
  } catch (error) {
    throw new APIError("Error uploading profile picture:", error);
  }
});

router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.email; // Adjust if email isn't used for fetching user
    const userProfile = await userRepository.getUserByEmail(userId);
    return userProfile
      ? sendResponse(res, 200, true, "Profile fetched successfully", userProfile)
      : sendResponse(res, 404, false, "User profile not found.");
  } catch (error) {
    throw new APIError("Error fetching user profile:", error);
  }
});

router.get("/Qrcode", async (req, res) => {
  try {
    const userId = req.user.id;
    const userLogs = await userRepository.getUserLogs(userId);
    const filename = `login_logs_${userId}_${Date.now()}.csv`;
    const csvFilePath = path.join(__dirname, "../../public/downloads", filename);

    await createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'user_id', title: 'User ID' },
        { id: 'username', title: 'Username' },
        { id: 'email', title: 'Email' },
        { id: 'location', title: 'Location' },
        { id: 'created_at', title: 'Created At' }
      ],
    }).writeRecords(userLogs);

    res.json({ success: true, url: `http://localhost:3000/downloads/${filename}` });
  } catch (error) {
    throw new APIError("Error generating CSV:", error);
  }
});

module.exports = router;
