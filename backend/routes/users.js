const express = require("express");
const router = express.Router();
const { sendResponse, getUserByEmail, getUserLogs} = require("../services/service");
const { query, upload } = require("../db/db");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

const updateUserDetails = async (updates, userId) => {
  const updateFields = Object.entries(updates).reduce(
    (acc, [key, value]) => {
      if (value) {
        acc.sql.push(`${key} = ?`);
        acc.params.push(value);
      }
      return acc;
    },
    { sql: [], params: [] }
  );

  if (updateFields.sql.length) {
    const updateSql = `UPDATE users SET ${updateFields.sql.join(
      ", "
    )} WHERE id = ?`;
    await query(updateSql, [...updateFields.params, userId]);
  }
};

router.post("/upload-profile-picture", upload, async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  const { file } = req;

  try {
    await (name || phone
      ? updateUserDetails({ name: name, phoneNumber: phone }, userId)
      : file
      ? query("UPDATE users SET logo = ? WHERE id = ?", [file.filename, userId])
      : sendResponse(res, 400, false, "No file uploaded"));

    sendResponse(res, 200, true, "Profile updated successfully");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
});

router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await getUserByEmail(userId);
    console.log(userProfile);
    return userProfile
      ? sendResponse(
          res,
          200,
          true,
          "Profile fetched successfully",
          userProfile
        )
      : sendResponse(res, 404, false, "User profile not found.");
  } catch (error) {
    console.error("Error fetching user profile:", error);
    sendResponse(res, 500, false, "Internal Server Error");
  }
});

router.get("/Qrcode", async (req, res) => {
    try {
      const userId = req.user.id;
      const userLogs = await getUserLogs(userId);
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
     
      res.json({ success: true, url: ` http://localhost:3000/downloads/${filename}` });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Error generating CSV" });
    }
  });

module.exports = router;
