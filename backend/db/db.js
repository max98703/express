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
const config = require('../config/config');  // Import the config

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
    user: "maxrai788@gmail.com",
    pass: "rqcuswodywcazihj",
  },
});

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  pool: config.pool
});

// Authenticate the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  
const beamsClient = new PushNotifications({
  instanceId: "12effc35-a27f-4fd4-ba62-1812b323b16c",
  secretKey: "68D2E9EEF567E632655D927DFE625200FC14D02C439D9AE15FD4BFFA12D73517",
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../public/image"),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 3000000 } 
});

module.exports = { app, query, sequelize,transporter, beamsClient, upload };
