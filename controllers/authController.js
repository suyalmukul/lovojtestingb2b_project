const passport = require("passport");
const Token = require("../models/token");
const bcrypt = require("bcryptjs");
const Otp = require("../models/otp");
const generateRandomNumber = (min, max) => Math.random() * (max - min) + min;
const crypto = require("crypto");
const fabricService = require("../services/fabric.service");
const sendEmail = require("../utils/sendemail");
const jwt = require("jsonwebtoken");
const Store = require("../models/stores");
const User = require("../models/user");
const StoreRating = require("../models/storeRating");
const StoreLike = require("../models/storeLikes");
const mongoose = require("mongoose");
const Fabric = require("../models/fabric");
const authKeys = require("../middleware/authKeys");
const Superadmin = require("../models/superadmin");
// const { Workers } = require("../models/Worker.model");
const Workers = require("../models/Worker.model");
const { sendingEmail } = require("../utils/sendingEmail");
const sendOtpmail = require("../utils/sendOtpmail");
const PersonalDetails = require("../models/personalDet");
const authService = require("../services/auth.services");
const AppError = require("../utils/errorHandler");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const uploadToS3 = require("../utils/s3Upload");
const { sendSMS } = require("../utils/sns.service");
const { getIO, getUserSocketId } = require("../utils/setupSocket");
const { sendEmailViaOneSignal } = require("../services/email.services");
const LovojShort = require('../models/lovojShorts');





/******************************************** FORGOT PASSWORD:  ****************************************/
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email address not provided", 400));
  }
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Email address not found", 400));
  }

  const now = new Date();
  const lastSent = user.otpSentAt;
  if (lastSent && now - lastSent < 30 * 1000) {
    return next(
      new AppError("OTP already sent, please try again after 30 seconds", 429)
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  // store OTP and sent time in user data
  user.otp = otp;
  user.otpSentAt = now;
  await user.save();

  // const success = await sendingEmail(
  //   email,
  //   "Forgot Password - OTP",
  //   `Your OTP for resetting your password is: ${otp}`
  // );

  const message = `Your OTP for resetting your password is: ${otp} Visit:https://www.lovoj.com/`

  // const success = await sendSMS(message, `91${user?.mobileNumber}`, "Lovoj");
  const success = await sendSMS(
    message,
    `91${user?.mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    process.env.FORGOT_PASS_SMS_AWS_TEMPLATE_ID
  );

  //One Signal email
  const emailData = {
    email,
    template_id: process.env.FOGORT_PASSWORD_OTP_TEMPLATE_ID,
    custom_data: {
      otpValue: otp
    }
  }
  sendEmailViaOneSignal(emailData)

  if (success) {
    console.log(`OTP sent to ${email}: ${otp}`);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent to mobile number" });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP." });
  }
});


/********************************************* RESET PASSWORD:  *****************************************/
exports.resetPasswordd = catchAsyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  if (!otp || !password) {
    return next(new AppError("Missing required parameters", 400));
  }
  const user = await User.findOne({ otp });

  if (!user) {
    return next(new AppError("Invalid OTP", 400));
  }

  const now = new Date();
  const otpSentAt = user.otpSentAt;
  if (!otpSentAt || now - otpSentAt > 5 * 60 * 1000) {
    return next(new AppError("OTP expired or not sent", 400));
  }

  // reset user password and clear OTP data
  user.password = password;
  user.otp = undefined;
  user.otpSentAt = undefined;
  await user.save();

  const success = await sendingEmail(
    user.email,
    "Password Reset Successfully",
    "Your password has been reset successfully."
  );
  //SMS
  // const message = `Your password has been reset successfully.`;
  // const sms = await sendSMS(message, `91${user?.mobileNumber}`, "Lovoj");
  const message = `Your password has been reset successfully. Visit: https://www.lovoj.com/`;
  const sms = await sendSMS(
    message,
    `91${user?.mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    process.env.RESET_PASS_SMS_AWS_TEMPLATE_ID
  );

  if (sms) {
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  }
});


/********************************************* RESEND OTP:  *********************************************/
exports.resendOTP = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email address not provided", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Incorrect email id", 400));
  }

  const now = new Date();
  const lastSent = user.otpSentAt;
  if (lastSent && now - lastSent < 30 * 1000) {
    return next(
      new AppError("OTP already sent, please try again after 30 seconds", 429)
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otpSentAt = now;
  await user.save();

  // if (
  //   await sendingEmail(
  //     email,
  //     "Forgot Password - OTP",
  //     `Your OTP for resetting your password is: ${otp}`
  //   )
  // ) {
  //   return res
  //     .status(200)
  //     .json({ success: true, message: "OTP sent to email" });
  // }

  //SMS
  // const message = `Your OTP for resetting your password is: ${otp}`;
  const message = `Your OTP for resetting your password is: ${otp} Visit:https://www.lovoj.com/`
  const sms = await sendSMS(
    message,
    `91${user?.mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    process.env.FORGOT_PASS_SMS_AWS_TEMPLATE_ID
  );
  // const sms = await sendSMS(message, `91${user?.mobileNumber}`, "Lovoj");
  //One Signal email
  const emailData = {
    email,
    template_id: process.env.FOGORT_PASSWORD_OTP_TEMPLATE_ID,
    custom_data: {
      otpValue: otp
    }
  }
  sendEmailViaOneSignal(emailData)
  return res
    .status(200)
    .json({ success: true, message: "OTP sent to mobile number." });

});




/********************************************* CHECK EMAIL:  *******************************************/

// exports.checkemail = catchAsyncError(async (req, res, next) => {
//   let { email, mobileNumber, countryCode } = req.body;

//   let user, check_Otp;
//   let type, value;

//   if (email && !mobileNumber) {
//     user = await User.findOne({ email });
//     type = "email";
//     value = email;
//   } else if (mobileNumber && !email) {
//     user = await User.findOne({ mobileNumber });
//     type = "mobileNumber";
//     value = mobileNumber;
//   } else if (email && mobileNumber) {
//     user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
//     type = user?.email === email ? "email" : "mobileNumber";
//     value = user?.email === email ? email : mobileNumber;
//   }
//   if (user) {
//     if (!user.activestatus) {
//       return res.status(404).json({
//         "success": false,
//         "message": "Your account is not active. Please contact the administrator."
//       });
//     }
//     mobileNumber = user.mobileNumber ? user.mobileNumber : null
//     countryCode = user.countryCode ? user.countryCode : 91
//   }
//   // if (!user) {
//   //   return res.status(404).json({
//   //     "success": false,
//   //     "message": "Your account is not registered  . Please contact the administrator."
//   //   });
//   // }

//   check_Otp = await Otp.findOne({ [type]: value });
//   if (check_Otp) {
//     await check_Otp.delete();
//   }

//   const otp_key = generateRandomNumber(100000, 900000).toFixed(0);
//   const hashed_otp_key = bcrypt.hashSync(otp_key, bcrypt.genSaltSync(10));

//   await new Otp({ [type]: value, otp_key: hashed_otp_key }).save();
//   countryCode = user&&user.countryCode?user.countryCode: 91

//   if (email && !mobileNumber) {
//     const emailData = {
//       email,
//       template_id: process.env.B2B_OTP_TEMPLATE_ID,
//       custom_data: {
//         otpValue: otp_key
//       }
//     };
//     sendEmailViaOneSignal(emailData);
//   } else if (mobileNumber && !email) {
//     try {
//       const sms = await sendSMS(
//         // `Your Verification Code for registration is: ${otp_key}`,
//         `Your Verification Code for registration is ${otp_key}. Visit: https://www.lovoj.com/`,
//         `${countryCode}${mobileNumber}`,
//         "Lovoj",
//         process.env.AWS_ENTITY_ID,
//         process.env.AWS_TEMPLATE_ID
//       );
//       if (!sms) {
//         return next(new AppError("Error sending OTP", 400));
//       }
//     } catch (error) {
//       console.error("Error sending SMS:", error);
//       return next(new AppError("Error sending OTP", 500));
//     }
//   } else if (email && mobileNumber) {
//     try {
//       const sms = await sendSMS(
//         // `Your Verification Code for registration is: ${otp_key}`,
//         `Your Verification Code for registration is ${otp_key}. Visit: https://www.lovoj.com/`,
//         // `91${mobileNumber}`,
//         `${countryCode}${mobileNumber}`,
//         "Lovoj",
//         process.env.AWS_ENTITY_ID,
//         process.env.AWS_TEMPLATE_ID
//       );
//       const emailData = {
//         email,
//         template_id: process.env.B2B_OTP_TEMPLATE_ID,
//         custom_data: {
//           otpValue: otp_key
//         }
//       };
//       sendEmailViaOneSignal(emailData);
//     } catch (error) {
//       console.error("Error sending SMS or Email:", error);
//       return next(new AppError("Error sending OTP", 500));
//     }
//   }

//   res.status(200).send({ success: true, message: `Otp sent Successfully` });
// });


exports.checkemail = catchAsyncError(async (req, res, next) => {
  let { email, mobileNumber, countryCode, type: flowType } = req.body;

  let user, check_Otp;
  let type, value;

  // Check user based on provided fields
  if (email && !mobileNumber) {
    user = await User.findOne({ email });
    type = "email";
    value = email;
  } else if (mobileNumber && !email) {
    user = await User.findOne({ mobileNumber });
    type = "mobileNumber";
    value = mobileNumber;
  } else if (email && mobileNumber) {
    user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    type = user?.email === email ? "email" : "mobileNumber";
    value = user?.email === email ? email : mobileNumber;
  }

  // If signup type is sent, block if email or mobile already exists
  if (flowType === "signup") {
    if (user) {
      const alreadyExistsField = user.email === email ? "Email" : "Mobile number";
      return res.status(400).json({
        success: false,
        message: `${alreadyExistsField} already registered.`,
      });
    }
  }else if (flowType === "login") {
    if (!user) {
      const alreadyExistsField = email ? "Email" : "Mobile number";
      return res.status(400).json({
        success: false,
        message: `${alreadyExistsField} not registered. Please sign up first.`,
      });
    }
  } else {
    // Regular flow (not signup) - if user exists, check active status
    if (user) {
      if (!user.activestatus) {
        return res.status(404).json({
          success: false,
          message: "Your account is not active. Please contact the administrator.",
        });
      }
      mobileNumber = user.mobileNumber || null;
      countryCode = user.countryCode || 91;
    }
  }

  // Clean up any previous OTP
  if (value && type) {
    check_Otp = await Otp.findOne({ [type]: value });
    if (check_Otp) {
      await check_Otp.delete();
    }
  }

  // Generate and hash new OTP
  const otp_key = generateRandomNumber(100000, 999999).toFixed(0);
  const hashed_otp_key = bcrypt.hashSync(otp_key, bcrypt.genSaltSync(10));
  await new Otp({ [type]: value, otp_key: hashed_otp_key }).save();

  countryCode = countryCode || 91;

  // Send OTP via Email or SMS
  try {
    if (email && !mobileNumber) {
      const emailData = {
        email,
        template_id: process.env.B2B_OTP_TEMPLATE_ID,
        custom_data: { otpValue: otp_key },
      };
      await sendEmailViaOneSignal(emailData);
    } else if (mobileNumber && !email) {
      const sms = await sendSMS(
        `Your Verification Code for registration is ${otp_key}. Visit: https://www.lovoj.com/`,
        `${countryCode}${mobileNumber}`,
        "Lovoj",
        process.env.AWS_ENTITY_ID,
        process.env.AWS_TEMPLATE_ID
      );
      if (!sms) throw new Error("SMS failed");
    } else if (email && mobileNumber) {
      const sms = await sendSMS(
        `Your Verification Code for registration is ${otp_key}. Visit: https://www.lovoj.com/`,
        `${countryCode}${mobileNumber}`,
        "Lovoj",
        process.env.AWS_ENTITY_ID,
        process.env.AWS_TEMPLATE_ID
      );
      const emailData = {
        email,
        template_id: process.env.B2B_OTP_TEMPLATE_ID,
        custom_data: { otpValue: otp_key },
      };
      await sendEmailViaOneSignal(emailData);
      if (!sms) throw new Error("SMS failed");
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return next(new AppError("Error sending OTP", 500));
  }

  return res.status(200).json({ success: true, message: "OTP sent successfully" });
});



/************************************ Edit Store Signup ************************************************/

exports.updateStore = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { profession, specialist, storeAddress, makingProductList, storeSignature, shopName, storeHeading, storeDescription, name, mobileNumber, location, experience, productStatus, measurmentStatus, fabricStatus, dataToDelete } = req.body;

  if (!id) {
    return next(new AppError("Invalid request. Please provide store ID.", 400));
  }

  // Check if 'storeImage' is present in the request and it contains files
  if (req.files && req.files.storeImage && req.files.storeImage.length > 0) {
    const addingStoreImage = req.files.storeImage[0];
    const storeImage = await uploadToS3(addingStoreImage);

    // Update only the 'storeImage' field
    await Store.findByIdAndUpdate(id, { storeImage });
  }

  const existingStore = await Store.findById(id);
  if (!existingStore) {
    return next(new AppError("Store not found with the provided ID.", 404));
  }

  // Update other fields if provided in the request body
  if (storeHeading !== undefined) {
    existingStore.storeHeading = storeHeading;
  }

  if (storeDescription !== undefined) {
    existingStore.storeDescription = storeDescription;
  }

  if (name !== undefined) {
    existingStore.name = name;
  }

  if (mobileNumber !== undefined) {
    existingStore.mobileNumber = mobileNumber;
  }
  if (location !== undefined) {
    existingStore.location = location;
  }
  if (shopName !== undefined) {
    existingStore.shopName = shopName;
  }
  if (storeAddress !== undefined) {
    existingStore.storeAddress = storeAddress;
  }
  if (experience !== undefined) {
    existingStore.experience = experience;
  }

  if (profession !== undefined) {
    existingStore.profession = profession;
  }
  if (storeSignature !== undefined) {
    existingStore.storeSignature = storeSignature;
  }
  if (specialist !== undefined) {
    // Split the string into an array of products
    const specialData = specialist.split(',');
    // Update the makingProductList array with the new products
    existingStore.specialist = specialData;
  }

  if (makingProductList !== undefined) {
    // Split the string into an array of products
    const productList = makingProductList.split(',');
    // Update the makingProductList array with the new products
    existingStore.makingProductList = productList;
  }
  // Delete specific data from the makingProductList array
  if (dataToDelete !== undefined) {
    const index = existingStore.makingProductList.indexOf(dataToDelete);
    console.log('Index to delete:', index);
    if (index !== -1) {
      existingStore.makingProductList.splice(index, 1);
    }
  }

  // Update productStatus, measurmentStatus, and fabricStatus
  const updateData = {
    productStatus: productStatus !== undefined ? productStatus : existingStore.productStatus,
    measurmentStatus: measurmentStatus !== undefined ? measurmentStatus : existingStore.measurmentStatus,
    fabricStatus: fabricStatus !== undefined ? fabricStatus : existingStore.fabricStatus,
    location: location !== undefined ? location : existingStore.location
  };

  await Store.findByIdAndUpdate(id, updateData);
  await User.findOneAndUpdate({ storeId: id }, updateData);


  await existingStore.save();



  // // Update user's and store's productStatus
  // await Store.findByIdAndUpdate(id, { productStatus: true });
  // await User.findOneAndUpdate({ storeId: id }, { productStatus: true });


  return res.status(200).json({
    success: true,
    message: "Store details updated successfully.",
    data: existingStore,
  });
});



/****************************************** SIGNUP CONTROLLER:  ****************************************/
exports.signUp = catchAsyncError(async (req, res, next) => {
  const { otp_key, email, storeType, mobileNumber, password, countryCode } = req.body;

  console.log(req.body, "...........................")

  let storeImage = null;

  if (!otp_key || !email || !storeType || !password)
    return next(
      new AppError(
        "Invalid request. Please provide OTP, email, and store type.",
        400
      )
    );

  const passwordRegex =
    /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;

  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must contain only alphabets and numbers, and be at least 6 characters long",
        400
      )
    );
  }


  // Check if 'storeImage' is present in the request and it contains files
  if (req.files && req.files.storeImage && req.files.storeImage.length > 0) {
    const addingStoreImage = req.files.storeImage[0];
    storeImage = await uploadToS3(addingStoreImage);
  }


  const check = await Store.findOne({ $or: [{ email }, { mobileNumber }] });
  if (check) return next(new AppError("Email or mobile number is already registered.", 409));

  // const check_email = await Otp.findOne({ mobileNumber });
  // if (!check_email) return next(new AppError("OTP not found.", 404));

  const check_email = await Otp.findOne({ $or: [{ mobileNumber }, { email }] }).sort({ createdAt: -1 });
  if (!check_email) return next(new AppError("OTP not found.", 404));

  const otpCreated = new Date(check_email.created).getTime();
  if (Date.now() - otpCreated > 2400000) {
    await check_email.delete();
    return res.status(403).send({ message: "Sign Up time expired." });
  }

  if (!bcrypt.compareSync(otp_key, check_email.otp_key))
    return res.status(400).send({ message: "Wrong OTP." });

  if (check_email.used)
    return res.status(400).send({ message: "This OTP is already used." });

  const latestStore = await Store.findOne({ storeType }).sort({
    storeNumber: -1,
  });
  const storeNumber = latestStore
    ? Number(latestStore.storeNumber.substring(1)) + 1
    : 100;

  const prefix =
    storeType === "Designer"
      ? "D"
      : storeType === "Fabric"
        ? "B"
        : storeType === "Factory"
          ? "C"
          : "A";

  const store = new Store({
    ...req.body,
    storeNumber: prefix + storeNumber,
    storeImage: storeImage,
  });
  await store.save();

  const user = new User({
    ...req.body,
    role: "admin",
    storeId: store._id,
    storeNumber: store.storeNumber,
    countryCode, // Save the countryCode in the User model
  });
  await user.save();

  const token = new Token({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await token.save();

  await check_email.remove()

  const replacements = { ...user.toObject() };
  const templates = "store-created-email";

  //SMS
  // const message = `Congratulations, your Store is successfully created with\nStore Number : ${user?.storeNumber}\nrole : ${user?.role}\nEmail : ${user?.email}\nStore Type : ${user?.storeType}`;
  // const sms = await sendSMS(message, `91${user?.mobileNumber}`, "Lovoj");

  const message = `Congratulations, your Store is successfully created with\nStore Number : ${user?.storeNumber}\nEmail : ${user?.email}. Visit https://www.lovoj.com/`;

  const sms = await sendSMS(
    message,
    `${countryCode}${user?.mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    process.env.ADMIN_SIGNUP_AWS_TEMPLATE_ID
  );
  await sendEmail(
    email,
    "Account and Store Created",
    res,
    templates,
    replacements
  );
  //res.status(201).send({ message: "User signed up successfully." });
});
exports.adminsignupbyadmin = catchAsyncError(async (req, res, next) => {
  const { email, storeType, mobileNumber, password, countryCode, location } = req.body;

  let storeImage = null;

  if (!email || !storeType || !password)
    return next(
      new AppError(
        "Invalid request. Please provide OTP, email, and store type.",
        400
      )
    );

  const passwordRegex =
    /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;

  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must contain only alphabets and numbers, and be at least 6 characters long",
        400
      )
    );
  }


  // Check if 'storeImage' is present in the request and it contains files
  if (req.files && req.files.storeImage && req.files.storeImage.length > 0) {
    const addingStoreImage = req.files.storeImage[0];
    storeImage = await uploadToS3(addingStoreImage);
  }


  const check = await Store.findOne({ $or: [{ email }, { mobileNumber }] });
  if (check) return next(new AppError("Email or mobile number is already registered.", 409));

  // const check_email = await Otp.findOne({ mobileNumber });
  // if (!check_email) return next(new AppError("OTP not found.", 404));

  const latestStore = await Store.findOne({ storeType }).sort({
    storeNumber: -1,
  });
  const storeNumber = latestStore
    ? Number(latestStore.storeNumber.substring(1)) + 1
    : 100;

  const prefix =
    storeType === "Designer"
      ? "D"
      : storeType === "Fabric"
        ? "B"
        : storeType === "Factory"
          ? "C"
          : "A";

  const store = new Store({
    ...req.body,
    storeNumber: prefix + storeNumber,
    storeImage: storeImage,
  });
  await store.save();

  const user = new User({
    ...req.body,
    role: "admin",
    storeId: store._id,
    storeNumber: store.storeNumber,
    countryCode,
    location, // Save the countryCode in the User model
  });
  await user.save();

  const token = new Token({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await token.save();


  const replacements = { ...user.toObject() };
  const templates = "store-created-email";

  //SMS
  // const message = `Congratulations, your Store is successfully created with\nStore Number : ${user?.storeNumber}\nrole : ${user?.role}\nEmail : ${user?.email}\nStore Type : ${user?.storeType}`;
  // const sms = await sendSMS(message, `91${user?.mobileNumber}`, "Lovoj");

  const message = `Congratulations, your Store is successfully created with\nStore Number : ${user?.storeNumber}\nEmail : ${user?.email}. Visit https://www.lovoj.com/`;
  try {
    const sms = await sendSMS(
      message,
      `${countryCode}${user?.mobileNumber}`,
      "Lovoj",
      process.env.AWS_ENTITY_ID,
      process.env.ADMIN_SIGNUP_AWS_TEMPLATE_ID
    );
    await sendEmail(
      email,
      "Account and Store Created",
      res,
      templates,
      replacements
    );
  } catch (ex) {
    console.log(ex)
  }

  // res.status(201).send({ message: "User signed up successfully." });
});



/********************************* Stylish Signup ************************/

exports.commonSignUp = catchAsyncError(async (req, res, next) => {
  const { otp_key, role, email, password, showPassword, mobileNumber, name, stylishlocation, stylishFullAddress, typeOfStylist, profile_image_url, gender } = req.body;

  if (!email || !password || !mobileNumber || !name || !role) {
    return next(new AppError("All fields are required", 400));
  }

  // const check = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  // if (check) return next(new AppError("Email or mobile number is already registered.", 409));

  const check = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (check) {
    return next(
      new AppError(
        `Email or mobile number is already registered for role: ${check.role}.`,
        409
      )
    );
  }

  let check_email;

  // If otp_key is provided, perform OTP verification
  if (otp_key) {
    check_email = await Otp.findOne({ $or: [{ email }, { mobileNumber }] });
    if (!check_email) return next(new AppError("OTP not found.", 404));

    const otpCreated = new Date(check_email.created).getTime();
    if (Date.now() - otpCreated > 2400000) {
      await check_email.delete();
      return next(new AppError("Sign Up time expired.", 403));
    }

    if (!bcrypt.compareSync(otp_key, check_email.otp_key))
      return next(new AppError("Wrong OTP.", 403));

    if (check_email.used)
      return next(new AppError("This OTP is already used.", 400));
  }

  const user = await User.create({
    email,
    password,
    showPassword,
    mobileNumber,
    name,
    role,
    stylishlocation,
    stylishFullAddress,
    typeOfStylist,
    profile_image_url,
    gender
  });

  if (otp_key) {
    await check_email.updateOne({ used: true }); // Mark the OTP as used
  }

  // const sms = await sendSMS(`Congratulations you are successfully registered!`, `91${mobileNumber}`, "Lovoj");
  const sms = await sendSMS(
    `Congratulations you are successfully registered! Visit:https://www.lovoj.com/`,
    `91${mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    process.env.COMMON_SIGNUP_AWS_TEMPLATE_ID
  );

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: { user },
  });
});


//login stylish now
exports.commonlogIn = (req, res, next) => {
  authService.commonAuthenticateUser(req, res, next);
};

/************************** Update Stylist data *********************/
exports.updateStylistData = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    role,
    mobileNumber,
    name,
    stylishlocation,
    stylishFullAddress,
    typeOfStylist,
    profile_image_url,
    gender,
    working_locations
  } = req.body;

  if (!id) {
    return next(new AppError("User ID is required", 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Update user fields
  const updatedData = {
    ...(mobileNumber && { mobileNumber }),
    ...(name && { name }),
    ...(role && { role }),
    ...(stylishlocation && { stylishlocation }),
    ...(stylishFullAddress && { stylishFullAddress }),
    ...(typeOfStylist && { typeOfStylist }),
    ...(profile_image_url && { profile_image_url }),
    ...(gender && { gender }),

  };
  if (Array.isArray(working_locations)) {
    updatedData.working_locations = working_locations
  }

  Object.assign(user, updatedData);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: { user },
  });
});



//send permession request
exports.toggleWebsiteAdminPermissionForStylish = async (req, res) => {
  const io = await getIO();
  const { id } = req.params;
  // console.log('id',id)
  try {
    const user = await User.findById(id);
    // console.log("store",store)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.websitePermission = !user.websitePermission;
    await user.save();

    // Socket emit
    const io = await getIO();
    if (io) {
      await io.emit('stylishShowReq', user);
    }

    res.json({ message: "Send Request Successfully to the Superadmin", user });
  } catch (error) {
    console.error("Error toggling super admin permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//listing for superadmin and admin both
exports.getStylishDetails = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;

  let { pipeline, countPipeline, totalCount } =
    await fabricService.getStylishPipeline(req.query, page, limit);

  let user = [];

  user = await User.aggregate(pipeline);

  const countResult = await User.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };
  return res.status(200).json({
    success: true,
    message: "Stylish Details Found Successfully....",
    totalCount,
    page,
    showingResults,
    user,
  });
});

/********************************************** deleteStoreApi:  ***************************************/
exports.deleteStore = catchAsyncError(async (req, res, next) => {
  const { storeNumber } = req.params;
  const store = await Store.findOne({ storeNumber });
  if (!store) {
    return res.status(404).send({ message: "Store not found." });
  }
  await User.deleteMany({ storeId: store._id });
  await Token.deleteMany({ userId: { $in: store.admins } });
  await Store.deleteOne({ _id: store._id });
  return res.status(200).send({ message: "Store deleted successfully." });
});

/****************************************** loginApi:  ************************************************/
exports.logIn = (req, res, next) => {
  authService.authenticateUser(req, res, next);
};

//loginApi with otp
exports.logInByOtp = (req, res, next) => {
  authService.authenticateUserWithOtp(req, res, next);
};



exports.deactiveOurAccount = catchAsyncError(async (req, res, next) => {
  const { type, activestatus } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!type || (type !== "user" && type !== "worker") || activestatus === undefined) {
    return res.status(400).json({ success: false, message: "Invalid request. Please provide valid type (user/worker) and activestatus." });
  }

  try {
    let updatedUser;
    if (type === "user") {
      updatedUser = await User.findByIdAndUpdate(userId, { $set: { activestatus } }, { new: true });
    } else {
      updatedUser = await Workers.findByIdAndUpdate(userId, { $set: { activestatus } }, { new: true });
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User/Worker not found." });
    }

    return res.status(200).json({ success: true, message: "Active status toggled successfully.", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});







// exports.deactiveOurAccountBySuperadmin = catchAsyncError(async (req, res, next) => {
//   const { type, activestatus } = req.body;
//   const { storeId } = req.params; // Extract storeId properly
//   const io = getIO(); // Get the Socket.IO instance

//   const user = await User.findOne({ storeId });
//   if (!user) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   if (!type || (type !== "user" && type !== "worker") || activestatus === undefined) {
//     return res.status(400).json({ success: false, message: "Invalid request. Please provide valid type (user/worker) and activestatus." });
//   }

//   try {
//     let updatedUser;
//     if (type === "user") {
//       updatedUser = await User.findOneAndUpdate({ storeId }, { $set: { activestatus } }, { new: true });
//     } else {
//       updatedUser = await Workers.findOneAndUpdate({ storeId }, { $set: { activestatus } }, { new: true });
//     }

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User/Worker not found." });
//     }

//     // Update activestatus in Store collection
//     const updatedStore = await Store.findByIdAndUpdate(storeId, { $set: { activestatus } }, { new: true });
//     if (!updatedStore) {
//       return res.status(404).json({ success: false, message: "Store not found." });
//     }

//     // **Find the user's socket ID from stored mapping**
//     const userSocketId = getUserSocketId(user._id.toString()); // Ensure user ID is string

//     // **Emit event to the specific user's socket**
//     if (io && userSocketId) {
//       io.to(userSocketId).emit("deactiveAccount", { storeId, activestatus });
//       console.log(`Socket event emitted to ${userSocketId}:`, { storeId, activestatus });
//     } else {
//       console.log(`No active socket connection for user ${user._id}`);
//     }

//     return res.status(200).json({ success: true, message: "Active status toggled successfully.", user: updatedUser, store: updatedStore });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });


exports.deactiveOurAccountBySuperadmin = async (req, res) => {
  try {
    console.log("API triggered: deactiveOurAccountBySuperadmin", req.body, req.params);

    const { type, activestatus } = req.body;
    const { storeId } = req.params; // Extract storeId properly
    const io = getIO(); // Get the Socket.IO instance

    if (!type || (type !== "user" && type !== "worker") || activestatus === undefined) {
      return res.status(400).json({ success: false, message: "Invalid request. Please provide valid type (user/worker) and activestatus." });
    }

    // Find user by storeId
    const user = await User.findOne({ storeId }).maxTimeMS(5000); // Add timeout for debugging
    if (!user) {
      console.log(`User not found for storeId: ${storeId}`);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    let updatedUser;
    if (type === "user") {
      updatedUser = await User.findOneAndUpdate({ storeId }, { $set: { activestatus } }, { new: true });
    } else {
      updatedUser = await Workers.findOneAndUpdate({ storeId }, { $set: { activestatus } }, { new: true });
    }

    if (!updatedUser) {
      console.log(`User/Worker not found for storeId: ${storeId}`);
      return res.status(404).json({ success: false, message: "User/Worker not found." });
    }

    // Update activestatus in Store collection
    const updatedStore = await Store.findByIdAndUpdate(storeId, { $set: { activestatus } }, { new: true });
    if (!updatedStore) {
      console.log(`Store not found for storeId: ${storeId}`);
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    // Find the user's socket ID from stored mapping
    const userSocketId = getUserSocketId(user._id.toString()); // Ensure user ID is a string

    // Emit event to the specific user's socket
    if (io && userSocketId) {
      io.to(userSocketId).emit("deactiveAccount", { storeId, activestatus });
      console.log(`Socket event emitted to ${userSocketId}:`, { storeId, activestatus });
    } else {
      console.log(`No active socket connection for user ${user._id}`);
    }
    const message = activestatus == true ? "Activated account successfully" : "Deactivated account successfully "
    return res.status(200).json({ success: true, message: message, user: updatedUser, store: updatedStore });

  } catch (error) {
    console.error("Error in deactiveOurAccountBySuperadmin:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};



/*************************************Worker with store Number: ******************************************/
exports.getWorkersByStoreNumber = catchAsyncError(async (req, res, next) => {
  const { storeNumber } = req.params;

  // Find workers by store number
  const workers = await Workers.find({ storeNumber });

  if (workers.length === 0) {
    return next(
      new AppError("No workers found for the specified store number.", 400)
    );
  }

  return res.status(200).json({ workers });
});

/***************************************** not use// sendOtpStore: ******************************************************/
exports.sendOTP = catchAsyncError(async (req, res) => {
  const { number, type, email } = await req.body;
  //   if (email && number) {
  //     return res.status(401).send({ msg: "verify by either email or number" });
  //   }
  if (email) {
    let check_Otp = await Otp.findOne({ email });
    if (check_Otp) {
      await check_Otp.delete();
    }
    let check_number = await Store.findOne({ email });
    const client = require("twilio")(accountSid, authToken);

    if (check_number) {
      const otp_key = generateRandomNumber(1111, 9999).toFixed(0);
      const create_opt = await new Otp({
        email: email,
        otp_key: bcrypt.hashSync(otp_key, bcrypt.genSaltSync(10)),
      }).save();
      var replacements = {
        code: otp_key,
      };
      var templates = "forget-password";
      await sendEmail(
        email,
        "CHEF ZONE REQUESTED OTP",
        res,
        templates,
        replacements
      );
    } else {
      return next(new AppError("User Not Found", 400));
    }
  } else {
    return res.status(401).send({ msg: "Email is required!" });
  }
});

/************************************************* getOtpStore:  ***********************************************/
exports.getOTP = catchAsyncError(async (req, res, next) => {
  const { otp_key, number, email } = await req.body;
  if (email) {
    let check_email = await Otp.findOne({ email });

    if (check_email) {
      const otpCreated = new Date(check_email.created).getTime();
      const now = new Date().getTime();
      const diff = now - otpCreated;
      if (diff > 300000) {
        return next(new AppError("OTP expire", 4003));
      }
      const check_otp = bcrypt.compareSync(otp_key, check_email.otp_key);
      if (!check_otp) {
        return next(new AppError("Wrong", 400));
      }
      return res.status(200).send({ status: 200, message: "OTP confirmed" });
      // res.send({ user: check_number });
    } else {
      res.send({ message: "number Not Found" });
    }
  }
});

/************************************************* otpPasswordStore:  *******************************************/
exports.otpPassword = catchAsyncError(async (req, res, next) => {
  const { otp_key, number, type, password, email } = await req.body;
  if (email) {
    let check_email = await Otp.findOne({ email });

    if (check_email) {
      const otpCreated = new Date(check_email.created).getTime();
      const now = new Date().getTime();
      const diff = now - otpCreated;
      if (diff > 1200000) {
        await check_email.delete();
        return res
          .status(403)
          .send({ status: 403, message: "Sign Up Time expired" });
      }
      const check_otp = bcrypt.compareSync(otp_key, check_email.otp_key);
      if (!check_otp) {
        return res.status(400).send({ status: 400, message: "Wrong OTP" });
      }
      if (check_email.used) {
        return res
          .status(400)
          .send({ status: 400, message: "This otp is used" });
      }
      var user = await Store.findOne({ email });

      user.password = password;

      await user.save();
      await check_email.delete();
      return res
        .status(200)
        .send({ status: 200, message: "Password updated successfully" });
      // res.send({ user: check_number });
    } else {
      res.send({ message: "otp Not Found" });
    }
  }
});

/************************************************* dummy personal details:  ***************************************/
exports.getPersonalDetailsStore = catchAsyncError(async (req, res, next) => {
  // User ID
  const user = req.user._id;

  // Fetch personal details for the user
  const personalDetails = await PersonalDetails.findOne({ user });

  // Check if personal details exist
  if (!personalDetails) {
    return res.status(404).json({
      success: false,
      message: "Personal details not found for this user.",
    });
  }

  // Fetch all stores
  const stores = await Store.find();

  return res.status(200).json({
    success: true,
    // personalDetails,
    stores,
  });
});


/************************************************* Own store details:  ***************************************/
exports.getOwnStoreDetails = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  const store = await Store.findById(storeId);
  if (!store)
    return res.status(404).json({ success: false, message: "Store not found." });

  return res.status(200).json({
    success: true,
    message: "Store Details Get Successfully..",
    store,
  });
});

/************************************************* checkWorker Token:  *******************************************/
exports.myProfileWorker = catchAsyncError(async (req, res, next) => {
  const user = await Workers.findById(req.user._id);
  console.log("worker", user)
  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  if (!user.activestatus) {
    return res.status(403).json({
      success: false,
      message: "Your account is not active. Please contact the administrator."
    });
  }
  return res.status(200).json({
    success: true,
    message: "User found",
    user,
  });
});


/*************************************************Check User Token ****************************************************/
exports.myProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  if (!user.activestatus) {
    return res.status(403).json({
      success: false,
      message: "Your account is not active. Please contact the administrator."
    });
  }

  return res.status(200).json({
    success: true,
    message: "User found",
    user,
    storeInfo: req.user?.storeInfo,
  });
});

/*************************************************Check User Token ****************************************************/
exports.myProfileStylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  return res.status(200).json({
    success: true,
    message: "User found",
    user,
  });
});


/**********************************************Like and Unlike: *******************************************************************/
exports.likeAndUnlikeStore = catchAsyncError(async (req, res, next) => {
  const storeLikeUnlikeStatus = await authService.likeUnlikeStore(
    req.params.id,
    req.user._id
  );
  if (!storeLikeUnlikeStatus) {
    return next(new AppError("Store not found", 404));
  } else if (storeLikeUnlikeStatus) {
    return res
      .status(200)
      .json({ success: true, message: storeLikeUnlikeStatus });
  }
});


/************************* Get Stores: FOR APPLICSATION *******************************/
exports.getStoreWithFabImages = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;

  let { pipeline, countPipeline, totalCount } =
    await fabricService.getStoreFabricPipeline(req.query, page, limit);

  let stores = [];

  stores = await Store.aggregate(pipeline);

  const countResult = await Store.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };
  stores = await fabricService.getFabricImagesOfStores(stores);
  return res.status(200).json({
    success: true,
    message: "Store with fabricImages",
    totalCount,
    page,
    showingResults,
    stores,
  });
});


/************************* Get Stores: FOR Website *******************************/
exports.getStoreWithStoreDetails = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;

  let { pipeline, countPipeline, totalCount } =
    await fabricService.getStoreFabricPipeline(req.query, page, limit);

  let stores = [];

  stores = await Store.aggregate(pipeline);

  const countResult = await Store.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };
  // stores = await fabricService.getFabricImagesOfStores(stores);
  return res.status(200).json({
    success: true,
    message: "Store with fabricImages",
    totalCount,
    page,
    showingResults,
    stores,
  });
});


/*********************************************************StorRating Api: *****************************************/
exports.createStoreRating = catchAsyncError(async (req, res) => {
  const { storeId, rating, comment } = req.body;

  if (rating > 5) {
    return res.status(400).json({ success: false, message: "Please enter a rating below 5" });
  }

  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  const existingRating = await StoreRating.findOne({ storeId, userId });

  if (existingRating) {
    return res.status(400).json({ error: "You have already rated this store" });
  }

  // Create the store rating
  const storeRating = new StoreRating({
    storeId,
    userId,
    rating: rating.toLocaleString('en-US', { minimumFractionDigits: 1 }),
    comment,
    name: user.name,
    email: user.email,
  });
  await storeRating.save();

  // Save userId in the userRatings array of the Store document
  store.userRatings.push({
    userId,
    name: user.name,
    email: user.email,
  });

  // Calculate the average rating for the store
  const allStoreRatings = await StoreRating.find({ storeId });
  const totalRatings = allStoreRatings.reduce((acc, curr) => acc + parseFloat(curr.rating), 0);

  // Update the Store document with the average rating rounded to one decimal place
  if (totalRatings !== 0) {
    const averageRating = totalRatings / allStoreRatings.length;
    const formattedAverageRating = averageRating.toLocaleString('en-US', { minimumFractionDigits: 1 });

    // Update the Store document with the formatted average rating
    store.averageRating = formattedAverageRating;
  } else {
    // Handle the case where there are no ratings
    store.averageRating = "0.0";
  }

  // Update the totalReviews field in the Store document
  store.totalReviews = allStoreRatings.length;

  await store.save();

  res.status(201).json({
    success: true,
    message: "Store rating created successfully",
    storeRating,
  });
});

/******************************************* Create Update Store Rating *********************************************/
exports.createOrUpdateStoreRating = catchAsyncError(async (req, res) => {
  const { storeId, rating, comment } = req.body;

  if (rating > 5) {
    return res.status(400).json({ success: false, message: "Please enter a rating below 5" });
  }

  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  const existingRating = await StoreRating.findOne({ storeId, userId });

  if (!existingRating) {
    return res.status(404).json({ error: "You have not rated this store yet" });
  }

  // Update the store rating
  existingRating.rating = rating.toLocaleString('en-US', { minimumFractionDigits: 1 });
  existingRating.comment = comment;

  await existingRating.save();

  // Recalculate the average rating for the store
  const allStoreRatings = await StoreRating.find({ storeId });
  const totalRatings = allStoreRatings.reduce((acc, curr) => acc + parseFloat(curr.rating), 0);

  // Update the Store document with the average rating rounded to one decimal place
  if (totalRatings !== 0) {
    const averageRating = totalRatings / allStoreRatings.length;
    const formattedAverageRating = averageRating.toLocaleString('en-US', { minimumFractionDigits: 1 });

    // Update the Store document with the formatted average rating
    store.averageRating = formattedAverageRating;
  } else {
    // Handle the case where there are no ratings
    store.averageRating = "0.0";
  }

  // Update the totalReviews field in the Store document
  store.totalReviews = allStoreRatings.length;

  await store.save();

  res.status(200).json({
    success: true,
    message: "Store rating updated successfully",
    storeRating: existingRating,
  });
});


/********************************************Get StoreRating: *******************************************************/
exports.getTotalStoreRating = catchAsyncError(async (req, res) => {
  const { storeId } = req.params;

  // Convert storeId to ObjectId (assuming it's a valid MongoDB ObjectId)
  const objectIdStoreId = mongoose.Types.ObjectId(storeId);

  // Calculate the total store rating and the number of ratings
  const ratingStats = await StoreRating.aggregate([
    { $match: { storeId: objectIdStoreId } },
    {
      $group: {
        _id: null,
        totalRating: { $sum: "$rating" },
        totalUsers: { $sum: 1 },
      },
    },
  ]);

  if (ratingStats.length === 0) {
    // If there are no ratings for the store, return 0 as the average rating
    return res.status(200).json({
      success: true,
      totalRating: 0,
      totalUsers: 0,
      averageRating: 0,
    });
  }

  const { totalRating, totalUsers } = ratingStats[0];

  // Calculate the average rating
  const averageRating = totalRating / totalUsers;

  res.status(200).json({
    success: true,
    totalRating,
    totalUsers,
    averageRating,
  });
});



/******************************************** Get all Stores (for superadmin ) api *************************************/
exports.superadminGetAllStores = catchAsyncError(async (req, res, next) => {
  const stores = await Store.find();

  if (!stores || stores.length === 0) {
    return next(new AppError("No stores found", 404));
  }

  // Return a response with a 200 status code and the stores data
  return res.status(200).json({ success: "true", message: "Stores found", data: stores });

});


/******************************************** Delete all Stores (for superadmin ) api *************************************/
exports.superadminDeleteStores = catchAsyncError(async (req, res, next) => {
  const { storeNumber } = req.params;
  const store = await Store.findOne({ storeNumber });
  if (!store) {
    return res.status(404).send({ message: "Store not found." });
  }
  await User.deleteMany({ storeId: store._id });
  await Token.deleteMany({ userId: { $in: store.admins } });
  await Store.deleteOne({ _id: store._id });
  return res.status(200).send({ message: "Store deleted successfully." });
});


/****************************************** Request For Permession  *********************************/

exports.toggleWebsiteAdminPermission = async (req, res) => {
  const io = await getIO();
  const { id } = req.params;
  // console.log('id',id)
  try {
    const store = await Store.findById(id);
    // console.log("store",store)
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    store.websitePermission = !store.websitePermission;
    await store.save();
    // Update superAdminPermission in the User collection
    await User.updateMany({ storeId: id }, { websitePermission: store.websitePermission });
    // console.log("Store updated:", store);
    const updatedUsers = await User.find({ storeId: id });
    // console.log("Users updated:", updatedUsers);

    // Socket emit
    const io = await getIO();
    if (io) {
      await io.emit('storeUpdated', store);
    }

    res.json({ message: "Send Request Successfully to the Superadmin", store });
  } catch (error) {
    console.error("Error toggling super admin permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};










/******************************************** Lovoj Reels **************************************/
//Add Admin Shorts
exports.createLovojShort = catchAsyncError(async (req, res, next) => {
  const newLovojShort = new LovojShort(req.body);

  await newLovojShort.save();

  res.status(201).json({
    success: true,
    message: 'LovojShort created successfully!',
    data: newLovojShort,
  });
});


// Get Admin Shorts
exports.getLovojShorts = catchAsyncError(async (req, res, next) => {
  const { showShorts, storeId, id } = req.query;

  let query = {};

  if (storeId) query.storeId = storeId;
  if (showShorts) query.showShorts = showShorts;
  if (id) {
    try {
      query._id = mongoose.Types.ObjectId(id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
  }

  let lovojShorts;
  if (id) {
    lovojShorts = await LovojShort.findOne(query);
    if (!lovojShorts) {
      return res.status(404).json({ success: false, message: 'LovojShort not found.' });
    }
    return res.status(200).json({ success: true, message: 'LovojShort retrieved successfully!', data: lovojShorts });
  } else {
    lovojShorts = await LovojShort.find(query).sort({ createdAt: -1 });
  }

  if (!lovojShorts.length) {
    return res.status(404).json({ success: false, message: 'No LovojShorts found.' });
  }

  res.status(200).json({ success: true, message: 'LovojShorts retrieved successfully!', data: lovojShorts });
});




//Get Shorts Data By Superadmin
exports.getLovojShortsBySuperadmin = catchAsyncError(async (req, res, next) => {
  const { storeId, id } = req.query;

  // Build query object based on provided query parameters
  let query = {};
  if (storeId) query.storeId = storeId;
  if (id) query._id = id;

  // Find documents based on the query object
  const lovojShorts = await LovojShort.find(query);

  // Check if no documents were found
  if (lovojShorts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No LovojShorts found.',
    });
  }

  // Return the found documents
  res.status(200).json({
    success: true,
    message: 'LovojShorts retrieved successfully!',
    data: lovojShorts,
  });
});


//Update Shorts Data By Superadmin
exports.updateLovojShort = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const updatedLovojShort = await LovojShort.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedLovojShort) {
    return res.status(404).json({
      success: false,
      message: 'LovojShort not found.',
    });
  }
  res.status(200).json({
    success: true,
    message: 'LovojShort updated successfully!',
    data: updatedLovojShort,
  });
});








