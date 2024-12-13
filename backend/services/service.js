/* eslint no-undef: "off" */
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query, transporter, beamsClient } = require("../db/db");
const { generateEmailContent } = require("../../src/components/Email/Email");
const { generateStripContent } = require("../../src/components/Email/stripEmail")
const { generateSubscriptionContent } = require("../../src/components/Email/subscription")
const geoip = require("geoip-lite");
const fetch = require("node-fetch"); // Ensure node-fetch is required
const { SuperfaceClient } = require('@superfaceai/one-sdk');
const sdk = new SuperfaceClient();

const generateToken = () => crypto.randomBytes(32).toString("hex");

const sendLoginEmail = async (user, subscription = null) => {
  const geo = await fetchGeoLocation();
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
  users= { ...user, geo, date:formattedDate }; // Add the formatted date to the user object
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: subscription ? users : users.email,
    subject: subscription ? "Subscription Expired" : "Login Notification",
    html: subscription ? generateSubscriptionContent() : generateEmailContent(users),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: 'maxrai788@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Login</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 120px;
          }
          .content {
            text-align: center;
            font-size: 18px;
          }
          .otp {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="https://www.ibm.com/support/pages/bulletin/images/psirt_logo.png" alt="IBM Security">
          </div>
          <div class="content">
            <h2>Verify your login</h2>
            <p>Below is your one-time passcode:</p>
            <div class="otp">${otp}</div>
            <p>It will expire in 5 minutes.</p>
          </div>
          <div class="footer">
            <p>We're here to help if you need it. Visit the <a href="https://www.ibm.com/security" target="_blank">MAX Support</a> for more info or <a href="mailto:support@ibm.com">contact us</a>.</p>
            <p>– MAX Security</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
}

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

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const publishLoginSuccessNotification = async (user) => {
  try {
    // Ensure user is an array of strings
    const interests = Array.isArray(user) ? user.map(String) : [String(user)];

    const { publishResponse } = await beamsClient.publishToInterests(
      interests, // This is now an array of strings
      {
        web: {
          notification: {
            title: "Task created",
            body: `You have been assigned to task`,
            deep_link: 'https://www.pusher.com',
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
    
    const geo = await fetchGeoLocation();
    const location = `${geo.addressCountry || "Unknown"}, ${geo.timezone || "Unknown"}`;

    await query(
      "INSERT INTO userLog (user_id, username, email, location) VALUES (?, ?, ?, ?)",
      [payload.id, payload.name, payload.email, location]
    );
  } catch (error) {
    console.log("Error logging event:", error);
  }
};
const fetchGeoLocation = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const geo = await run(data.ip);
    return geo;
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    throw new Error("Failed to fetch geolocation.");
  }
};

async function run(ip) {
  // Load the profile
  const profile = await sdk.getProfile("address/ip-geolocation@1.0.1");

  // Use the profile
  const result = await profile.getUseCase("IpGeolocation").perform(
    {
      ipAddress: ip
    },
    {
      provider: "ipdata",
      security: {
        apikey: {
          apikey: "9a511b6fc8334e1852cfbbd4ff3f1af3c42ed6abc75e96a1648b969a"
        }
      }
    }
  );

  // Handle the result
  try {
    const data = result.unwrap();
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function isSuperAdmin(user){
  if(user.role == 'superadmin'){
    return true;
  }
  return false;
}
module.exports = {
  generateToken,
  sendLoginEmail,
  getUserByEmail,
  comparePasswords,
  publishLoginSuccessNotification,
  sendResponse,
  sendEmailWithReceipt,
  hashPassword,
  eventLog,
  sendOtpEmail,
  isSuperAdmin,
};
