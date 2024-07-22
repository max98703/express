const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query, transporter, beamsClient } = require("../db/db");
const { generateEmailContent } = require("../../src/components/Email/Email");

const generateToken = () => crypto.randomBytes(32).toString("hex");

const sendLoginEmail = async (user) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Login Notification",
    html: generateEmailContent(user),
  };

  try {
    const { response } = await transporter.sendMail(mailOptions);
    console.log("Email sent:", response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

const getUserByEmail = async (email) => {
  const [user] = await query("SELECT * FROM users WHERE email = ?", [email]);
  return user;
};

const updateUser = async (userData, token) => 
  query("UPDATE users SET name = ?, token = ? WHERE email = ?", [userData.name, token, userData.email]);

const insertUser = async (userData, token) => 
  query("INSERT INTO users (id, email, name, logo, token, googleLogin) VALUES (?, ?, ?, ?, ?, ?)", 
        [userData.id, userData.email, userData.name, userData.picture, token, userData.googleLogin]);

const comparePasswords = (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const publishLoginSuccessNotification = async (user) => {
  try {
    const { publishResponse } = await beamsClient.publishToInterests(["login_success"], {
      web: {
        notification: {
          title: "Login Success",
          body: `${user.email} logged in successfully!`,
        },
      },
    });
    console.log("Notification sent:", publishResponse);
  } catch (error) {
    console.error("Error publishing notification:", error);
    throw new Error("Failed to publish notification.");
  }
};

const sendResponse = (res, statusCode, success, message, user = null) => 
  res.status(statusCode).json({ success, message, user });

module.exports = {
  generateToken,
  sendLoginEmail,
  getUserByEmail,
  updateUser,
  insertUser,
  comparePasswords,
  publishLoginSuccessNotification,
  sendResponse,
};

