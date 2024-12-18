/* eslint no-undef: "off" */

const express = require("express");
const path = require("path");
const { sendResponse } = require("../services/service");
const { APIError } = require('../utils/app-errors');
const UserLoginRepository = require("../db/repository/UserLoginRepository");
const userRepository=require("../db/repository/user-repository");
const { upload } = require("../db/db");
const { createObjectCsvWriter } = require("csv-writer");
const { err } = require("@superfaceai/one-sdk");

class UserController {
  constructor() {
    this.userLoginRepository = new UserLoginRepository();
    this.userRepository=new userRepository();
    this.router = express.Router();
    this.initializeRoutes();
  }
  

  initializeRoutes() {
    this.router.post('/upload-profile-picture',   upload.single("myImage"), this.uploadProfilePicture.bind(this));
    this.router.get('/profile', this.getProfile.bind(this));
   // this.router.post('/create-payment-method', this.generateQRCode.bind(this));
    this.router.get('/Qrcode/:userId', this.generateQRCode.bind(this));
    this.router.get('/user', this.users.bind(this));
  }

  async uploadProfilePicture(req, res) {
    const userId = req.user.user_id;
    const { name, phone } = req.body;
    const { file } = req;
    try {
      if (name || phone) {
        await this.userRepository.update(userId,{ name, phoneNumber: phone }, userId);
      }

      if (file) {
        await this.userRepository.update(userId, {logo:file.filename});
      } else if (!name && !phone) {
        return sendResponse(res, 400, false, "No file uploaded");
      }

      sendResponse(res, 200, true, "Profile updated successfully");
    } catch (error) {
      throw new APIError("Error uploading profile picture:", error);
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.user_id; // Adjust if email isn't used for fetching user
      const userProfile = await this.userRepository.findById(userId);
      return userProfile
        ? sendResponse(res, 200, true, "Profile fetched successfully", userProfile)
        : sendResponse(res, 404, false, "User profile not found.");
    } catch (error) {
      throw new APIError("Error fetching user profile:", error);
    }
  }
  
  async users(req,res){
    try{
      const users = await this.userRepository.findAll();
      console.log(users);
      res.status(200).json(users);
    }catch(error){
      throw new APIError("Error fetching user profile:", error);
    }
  }
  async generateQRCode(req, res) {
    console.log('max');
    try {
      const user_id =  req.params.userId;  // Get the user_id from the request
      console.log(user_id);
      // Fetch user login logs for the specific user
      const userLogs = await this.userLoginRepository.findAll({
        where: { user_id: user_id }  // Query by user_id
      });
  
      // Check if userLogs is an empty array or null
      if ( userLogs.length === 0) {
        return res.json({ success: false, message:"No data found for the requested user."});
      }
  
  
      // Define the CSV filename
      const filename = `login_logs_${user_id}_${Date.now()}.csv`;
      const csvFilePath = path.join(__dirname, "../../public/downloads", filename);
  
      // Create the CSV file with the correct headers and data mapping
      const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'user_id', title: 'User ID' },  // Column for user_id
          { id: 'logged_in_at', title: 'Logged In At' },  // Column for logged_in_at
          { id: 'logged_out_at', title: 'Logged Out At' },  // Column for logged_out_at
          { id: 'ip_address', title: 'IP Address' },  // Column for ip_address
          { id: 'device', title: 'Device' }  // Column for device
        ],
      });
  
      // Write the userLogs data to the CSV file
      await csvWriter.writeRecords(userLogs.map(log => ({
        user_id: log.user_id,
        logged_in_at: log.logged_in_at,  // Use logged_in_at
        logged_out_at: log.logged_out_at,  // Use logged_out_at
        ip_address: log.ip_address,  // Use ip_address
        device: log.device  // Use device
      })));
  
      // Send the download URL in the response
      res.json({ success: true, url: `http://localhost:3000/downloads/${filename}` });
    } catch (error) {
      console.log(error);  // Log any errors for debugging
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
}

module.exports = new UserController().router;