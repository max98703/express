const speakeasy = require('speakeasy');
const base32 = require('base32.js');

const SPEAKEASY_CONFIG = {
  step: 30,  // Step in seconds, OTP will change every 30 seconds
  digits: 6,  // Length of OTP (6 digits)
  window:2,  // Time window for verification (allow for 1 step before/after current OTP)
  encoding: 'base32',  // The encoding format for the OTP secret
};

// Function to generate OTP
const generateOtp = (secretKey) => {
  // Ensure the secret key is Base32 encoded
  const encodedSecret = secretKey;
  return speakeasy.totp({
    secret: encodedSecret,
    step: SPEAKEASY_CONFIG.step,
    digits: SPEAKEASY_CONFIG.digits,
    encoding: SPEAKEASY_CONFIG.encoding,
  });
};

// Function to verify OTP
const verifyOtp = (secret, otp) => {
  // Ensure the secret key is Base32 encoded before verification
  const encodedSecret = secret;
  return speakeasy.totp.verify({
    secret: encodedSecret,
    token: otp,
    step: SPEAKEASY_CONFIG.step,
    digits: SPEAKEASY_CONFIG.digits,
    encoding: SPEAKEASY_CONFIG.encoding,
  });
};

module.exports = { generateOtp, verifyOtp };
