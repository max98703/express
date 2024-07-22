const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, getUserByEmail, updateUser, insertUser, comparePasswords, sendLoginEmail, publishLoginSuccessNotification, sendResponse } = require('../services/service');
const { query } = require('../db/db');
const authenticateUser = require('../middleware/authenticateUser');

const secret = process.env.SECRET_KEY || 'some other secret as default';

router.post("/login", async (req, res) => {
  const { email, password, id, picture, googleLogin } = req.body;

  const user = id ? await getUserByEmail(email) : null;
  const token = user?.token || generateToken();

  if (id) {
    await (user
      ? updateUser(req.body, token)
      : insertUser({ ...req.body, id: crypto.randomBytes(8).toString("hex"), googleLogin: 1 }, token));
  } else {
    if (!user || !(await comparePasswords(password, user.password))) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }
  }

  const payload = {
    id: user?.id || id,
    name: user?.name || req.body.name,
    email,
    token,
    googleLogin: user?.googleLogin || googleLogin,
    logo: user?.logo || picture,
    phoneNumber: user?.phoneNumber || null,
  };

  req.session.token = await jwt.sign(payload, secret, { expiresIn: 36000 });

  setImmediate(() => sendLoginEmail(payload));
  publishLoginSuccessNotification(payload).catch(error => console.error("Error publishing notification:", error));

  return sendResponse(res, 200, true, "Login successful and email sent", req.session.token);
});

router.post('/reset-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.user;

  if (!id) return sendResponse(res, 400, false, 'User ID is required.');

  const [user] = await query('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) return sendResponse(res, 404, false, 'User not found.');
  if (!(await comparePasswords(currentPassword, user.password))) return sendResponse(res, 401, false, 'Invalid current password.');
  if (newPassword !== confirmPassword) return sendResponse(res, 400, false, 'New password and confirm password do not match.');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

  return sendResponse(res, 200, true, 'Password reset successful.');
});

router.post("/checkTokenValidity", async (req, res) => {
  const { token } = req.body;
  try {
    const results = await query("SELECT * FROM users WHERE token = ?", [token]);
    return sendResponse(res, results.length > 0 ? 200 : 401, results.length > 0, results.length > 0 ? undefined : "Invalid token");
  } catch (error) {
    console.error("Error during token validation:", error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
});

module.exports = router;
