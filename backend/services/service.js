const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query, transporter, beamsClient } = require("../db/db");
const { generateEmailContent } = require("../../src/components/Email/Email");
const { generateStripContent } = require("../../src/components/Email/stripEmail")
const { generateSubscriptionContent } = require("../../src/components/Email/subscription")
const geoip = require("geoip-lite");
const fetch = require("node-fetch"); // Ensure node-fetch is required


const generateToken = () => crypto.randomBytes(32).toString("hex");

const sendLoginEmail = async (user, subscription = null) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: subscription ? user : user.email,
    subject: subscription ? "Subscription Expired" : "Login Notification",
    html: subscription ? generateSubscriptionContent() : generateEmailContent(user),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};
const sendEmailWithReceipt = async (intent) => {
  console.log("ok", intent.metadata.user_id);
  let user = await getUserByEmail(intent.metadata.user_id);
  console.log(user);
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: intent.description,
    html: generateStripContent(user, intent),
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
  const [user] = await query("SELECT * FROM users WHERE id = ?", [email]);
  return user;
};

const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const publishLoginSuccessNotification = async (user) => {
  try {
    console.log(user.id);
    const { publishResponse } = await beamsClient.publishToInterests(
      [user.id],
      {
        web: {
          notification: {
            title: "Login Success",
            body: `${user.email} logged in successfully!`,
          },
        },
      }
    );
    console.log("Notification sent:", publishResponse);
  } catch (error) {
    console.error("Error publishing notification:", error);
    throw new Error("Failed to publish notification.");
  }
};

const sendResponse = (res, statusCode, success, message, user = null) => {
  return res.status(statusCode).json({ success, message, user });
};

const eventLog = async (req, payload) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const geo = geoip.lookup(data.ip);
    const location = `${geo.city || "Unknown"}, ${geo.timezone || "Unknown"}`;

    await query(
      "INSERT INTO userLog (user_id, username, email, location) VALUES (?, ?, ?, ?)",
      [payload.id, payload.name, payload.email, location]
    );
  } catch (error) {
    console.log("Error logging event:", error);
  }
};

module.exports = {
  generateToken,
  sendLoginEmail,
  getUserByEmail,
  comparePasswords,
  publishLoginSuccessNotification,
  sendResponse,
  sendEmailWithReceipt,
  eventLog,
};
