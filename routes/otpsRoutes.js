const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPasswordd,
} = require("../controllers/authController");

// endpoint for sending OTP to user's email
router.post("/forgot-password", forgotPassword);

// endpoint for resetting password with OTP validation
router.post("/reset-password", resetPasswordd);

module.exports = router;
