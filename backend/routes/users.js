const express = require('express');
const router = express.Router();
const { sendResponse, getUserByEmail } = require('../services/service');
const { query, upload } = require('../db/db');

const updateUserDetails = async (updates, userId) => {
    const updateFields = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value) {
            acc.sql.push(`${key} = ?`);
            acc.params.push(value);
        }
        return acc;
    }, { sql: [], params: [] });

    if (updateFields.sql.length) {
        const updateSql = `UPDATE users SET ${updateFields.sql.join(', ')} WHERE id = ?`;
        await query(updateSql, [...updateFields.params, userId]);
    }
};

router.post("/upload-profile-picture", upload, async (req, res) => {
    const userId = req.user.id;
    const { name, phone } = req.body;
    const { file } = req;

    try {
        await (name || phone
            ? updateUserDetails({ name:name, phoneNumber:phone }, userId)
            : file
                ? query("UPDATE users SET logo = ? WHERE id = ?", [file.filename, userId])
                : sendResponse(res, 400, false, "No file uploaded"));

        sendResponse(res, 200, true, "Profile updated successfully");
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
});

router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.email;
        const userProfile = await getUserByEmail(userId);

        return userProfile
            ? sendResponse(res, 200, true, "Profile fetched successfully", userProfile)
            : sendResponse(res, 404, false, 'User profile not found.');
    } catch (error) {
        console.error('Error fetching user profile:', error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
});

module.exports = router;
