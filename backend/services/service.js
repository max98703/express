const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query, transporter, beamsClient } = require("../db/db");
const { generateEmailContent } = require("../../src/components/Email/Email");
const geoip = require("geoip-lite");
const fetch = require("node-fetch"); // Ensure node-fetch is required


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
const sendEmailWithReceipt = async (intent) => {
  console.log("ok", intent.metadata.user_id);
  let user = await getUserByEmail(intent.metadata.user_id);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: intent.description,
    html: EmailContent(user, intent),
  };

  try {
    const { response } = await transporter.sendMail(mailOptions);
    console.log("Email sent:", response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

const EmailContent =  (user, intent) => {
  return `
    <div style="background-color: #f9f9f9; border-radius: 10px; padding: 20px; border: 1px solid #ddd;">
      <h2 style="margin: 0; font-family: Arial, sans-serif;">Dear ${user.name},</h2>
      <p style="font-family: Arial, sans-serif;">Thank you for your payment. Your transaction was successful!</p>
      <p style="font-family: Arial, sans-serif;">Transaction ID: ${intent.id}</p>
      <p style="font-family: Arial, sans-serif;">Balance Transaction: ${intent.balance_transaction}</p>
      <p style="font-family: Arial, sans-serif;">You can view your receipt here: <a href="${intent.receipt_url}" style="color: #1a73e8;">Receipt Link</a></p>
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFHVxZMKfYxX6i4wIyCSuxb-c96ViqtIcpNA&s" alt="Company Logo" style="width: 200px; height: auto; margin-top: 20px; border-radius: 8px;"/>
      <p style="font-family: Arial, sans-serif;">We appreciate your business.</p>
      <br>
      <p style="font-family: Arial, sans-serif;">Best regards,</p>
      <p style="font-family: Arial, sans-serif;">Your Company</p>
    </div>
  `;
};



const getUserByEmails = async (email) => {
  const [user] = await query("SELECT * FROM users WHERE email = ? AND (googleLogin IS NULL OR googleLogin = 0)", [email]);
  return user;
};


const getUserBygoogleId = async (id) => {
  const [user] = await query("SELECT * FROM users WHERE id = ?", [id]);
  return user;
};

const getUserByEmail = async (email) => {
  const [user] = await query("SELECT * FROM users WHERE email = ?", [email]);
  return user;
};

const getUserLogs = async (id) => {
  const rows = await query(
    "SELECT user_id, username, email, location, created_at FROM userlog WHERE user_id = ?",
    [id]
  );
  return rows;
};

const updateUser = async (userData, token) => {
  return query("UPDATE users SET name = ?, token = ? WHERE id = ?", [
    userData.name,
    token,
    userData.id,
  ]);
};

const insertUser = async (userData, token) => {
  return query(
    "INSERT INTO users (id, email, name, logo, token, googleLogin) VALUES (?, ?, ?, ?, ?, ?)",
    [
      userData.id,
      userData.email,
      userData.name,
      userData.picture,
      token,
      userData.googleLogin,
    ]
  );
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
  updateUser,
  insertUser,
  comparePasswords,
  publishLoginSuccessNotification,
  sendResponse,
  sendEmailWithReceipt,
  eventLog,
  getUserLogs,
  getUserBygoogleId,
  getUserByEmails,
};
