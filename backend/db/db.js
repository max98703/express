/* eslint no-undef: "off" */

const mysql = require('mysql');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Sequelize = require('sequelize');
const PushNotifications = require('@pusher/push-notifications-server');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const query = (sql, values) => 
  new Promise((resolve, reject) => 
    pool.query(sql, values, (error, results) => error ? reject(error) : resolve(results))
  );

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sequelize = new Sequelize('movies', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 10000,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log(process.env.DB_Name)
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  
const beamsClient = new PushNotifications({
  instanceId: process.env.INSTANCE_ID,
  secretKey: process.env.SECRET_KEY,
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../public/image"),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 3000000 } 
}).single("myImage");

module.exports = { app, query, sequelize,transporter, beamsClient, upload };
