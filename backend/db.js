const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'Avdqead34@#43@#$', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

const pool = mysql.createPool({
  host:  process.env.DB_HOST,
  user:  process.env.DB_USER,
  password: process.env.DB_PASS, 
  database:  process.env.DB_NAME,
});

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results, fields) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:  process.env.GMAIL_USER,
      pass:  process.env.GMAIL_PASS
    }
});

module.exports = { app,query ,transporter};
