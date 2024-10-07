/* eslint no-undef: "off" */

var jwt = require('jsonwebtoken');
var customId = require("custom-id");
const User_LoginRepository = require("../db/repository/UserLoginRepository");
const { sendResponse} = require("../services/service");
var createToken = async function(req) {
 
    const token_id = await customId({
      user_id : req.auth.id,
      date : Date.now(),
      randomLength: 4 
    });
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress

    const user_logins=await User_LoginRepository.findAll({where:{ user_id: req.auth.id ,token_deleted:false, ip_address:ip, device: req.headers["user-agent"]}});
    user_logins.forEach(async(login) => {
      if(login){
        login.token_deleted=true;
        await login.save()
      }      
    });
    
    const token_secret=await customId({
      token_secret : ip,
      date : Date.now(),
      randomLength: 8 
    });

    const data = await User_LoginRepository.create({
      user_id : req.auth.id,
      token_id : token_id,
      token_secret : token_secret ,
      ip_address : ip ,
      device : req.headers["user-agent"]
    });
    console.log(data);
    const token_user = { ...req.auth, token_id: token_id  };
    console.log(token_user)
    const accessToken = await jwt.sign(token_user, process.env.SECRET);
    return accessToken;
};

module.exports = {
  generateTokens: async function(req, res, next) {
      req.token = await createToken(req);
      return next();
  },

  sendToken: function(req, res) {
    return sendResponse(res, 200, true, "Login successful and email sent", req.token);
  }
};