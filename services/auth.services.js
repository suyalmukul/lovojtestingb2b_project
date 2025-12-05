const passport = require("passport");
const AppError = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Otp = require("../models/otp");
const bcrypt = require("bcryptjs");
const Workers = require("../models/Worker.model");
const authKeys = require("../middleware/authKeys");
const Store = require("../models/stores");
const StoreLike = require("../models/storeLikes");
const { colorizeText } = require("../utils/others");




/********************************* Main/Imp like api if any changes then reference this api *************************/
/*************************** testing/api for but now we use this *********************************/


exports.likeUnlikeStore = async (storeId, userId) => {
  const storeLike = await StoreLike.findOne({ storeId });

  if (!storeLike) {
    // If storeLike document not found, create a new one
    const user = await User.findById(userId);
    if (!user) {
      // Return an error or handle the case where the user does not exist
      throw new Error('User not found');
    }

    await StoreLike.create({
      storeId,
      totalLike: 1,
      userLikes: [
        {
          userId: user._id,
          name: user.name,
          email: user.email,
        },
      ],
    });

    // Increment totalLike in the Store document
    await Store.findByIdAndUpdate(storeId, { $inc: { totalLike: 1 } });

    return 'Store Liked';
  } else {
    const isLiked = storeLike.userLikes.some((userLike) => userLike.userId.equals(userId));

    if (isLiked) {
      // If already liked, remove the user's details from userLikes array
      storeLike.userLikes = storeLike.userLikes.filter(
        (userLike) => !userLike.userId.equals(userId)
      );
      storeLike.totalLike -= 1;
      await storeLike.save();

      // Decrement totalLike in the Store document
      await Store.findByIdAndUpdate(storeId, { $inc: { totalLike: -1 } });

      // Remove user's details from Store document's userLikes array
      await Store.findByIdAndUpdate(storeId, {
        $pull: { userLikes: { userId: userId } },
      });

      return 'Store Unliked';
    } else {
      // If not liked, add the userId to the userLikes array
      const user = await User.findById(userId);
      if (!user) {
        // Return an error or handle the case where the user does not exist
        throw new Error('User not found');
      }

      storeLike.userLikes.push({
        userId: user._id,
        name: user.name,
        email: user.email,
      });

      storeLike.totalLike += 1;
      await storeLike.save();

      // Increment totalLike in the Store document
      await Store.findByIdAndUpdate(storeId, { $inc: { totalLike: 1 } });

      // Add user's details to Store document's userLikes array
      await Store.findByIdAndUpdate(storeId, {
        $push: { userLikes: { userId: user._id, name: user.name, email: user.email } },
      });

      return 'Store Liked';
    }
  }
};


/************** Solve superadmin and admin both login bug , but this time we not use this in future we use... ************/

exports.authenticateUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new AppError("invalid email or password.", 401));
      }
      const { email, password, storeNumber, role, storeType, deviceToken } = req.body;

      if (role === "admin") {
        const userFromDB = await User.findOne({ email });

        if (!userFromDB || userFromDB.email !== email) {
          return next(new AppError("Invalid email", 400));
        }
        if (userFromDB.role !== role&&userFromDB.role!=='superadmin') {
          return next(new AppError("Invalid role", 400));
        }
        if (userFromDB.storeType !== storeType&&userFromDB.role!=='superadmin') {
          return next(new AppError(`Login to the account with the correct storeType (${userFromDB.storeType}).`, 400));
        }
        const role1 = userFromDB?.role ? userFromDB.role : null
        // Check activestatus
        if (!userFromDB.activestatus) {
          return next(new AppError("Your account was deactivated for some reason. Please contact the administrator...", 403));
        }

        const token = jwt.sign({ _id: user._id, role:role1 }, authKeys.jwtSecretKey, { expiresIn: '15d' });

        if (deviceToken) {
          userFromDB.deviceToken = deviceToken;
          await userFromDB.save();
        }

        console.log("User Email logged in : ", colorizeText(userFromDB.email, 'blue'));

        return res.status(200).json({
          success: true,
          message: "Successfully logged in!",
          token: token,
          user: userFromDB,
          deviceToken: deviceToken,
        });
      } else if (role === "superadmin") {
        let query = {email}
        if(storeType){
          storeType
        }
        const userFromDB = await User.findOne({ email });
        const role1 = userFromDB?.role ?userFromDB?.role  : null

        if (!userFromDB || userFromDB.role !== "superadmin" || userFromDB.email !== email) {
          return next(new AppError("Invalid credentials", 400));
        }

        const token = jwt.sign({ _id: user._id, role:role1 }, authKeys.jwtSecretKey,{ expiresIn: '15d' });

        return res.status(200).json({
          token: token,
          message: "You are Signed in as SuperAdmin!",
        });
      } else {
        const isWorkerRole = [
          "manager",
          "sales",
          "cutter",
          "mastertailor",
          "stitching",
          "accessories",
          "QC",
          "delivery",
        ].includes(role);

        if (isWorkerRole) {
          // const workerFromDB = await Workers.findOne({ email });
          const workerFromDB = await Workers.findOne({ email, storeNumber });

          if (!workerFromDB) {
            return next(new AppError("Invalid credentials", 400));
          }
          if (workerFromDB.email !== email) {
            return next(new AppError("Invalid email", 400));
          }
          if (workerFromDB.storeNumber !== storeNumber) {
            return next(new AppError("Invalid store number", 400));
          }
          if (workerFromDB.role !== role) {
            return next(new AppError("Invalid store role", 400));
          }
          // Check activestatus
          if (!workerFromDB.activestatus) {
            return next(new AppError("Your account was deactivated for some reason. Please contact the administrator...", 403));
          }
          const role1 = workerFromDB?.role ? workerFromDB?.role : null
          const workerToken = jwt.sign({ _id: workerFromDB._id, role:role1 }, authKeys.jwtSecretKey, { expiresIn: '15d' });

          if (deviceToken) {
            workerFromDB.deviceToken = deviceToken;
            await workerFromDB.save();
          }

          return res.status(200).json({
            success: true,
            message: "Successfully logged in!",
            token: workerToken,
            worker: workerFromDB,
            deviceToken: deviceToken,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return next(new AppError("Server error", 500));
    }
  })(req, res, next);
};

/*************************Now main 3 main********************* */

// exports.authenticateUserWithOtp = async (req, res, next) => {
//   const { mobileNumber, email, otp_key } = req.body;

//   // Check if either email or mobile number is provided
//   if (!email && !mobileNumber) {
//     return next(new AppError("Email or mobile number is required.", 400));
//   }

//   try {
//     let user;

//     // Check if user exists by email or mobile number
//     if (email) {
//       user = await User.findOne({ email });
//     } else {
//       user = await User.findOne({ mobileNumber });
//     }

//     // If user found, proceed with OTP verification
//     if (user) {
//       // Check if OTP key is provided
//       if (!otp_key) {
//         throw new AppError("OTP is required for verification.", 400);
//       }

//       let otp;

//       if (email) {
//         // Find the latest unused OTP for the provided email
//         otp = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
//       } else {
//         // Find the latest unused OTP for the provided mobile number
//         otp = await Otp.findOne({ mobileNumber, used: false }).sort({ createdAt: -1 });
//       }

//       // If no unused OTP found, return error
//       if (!otp) {
//         throw new AppError("OTP not found or already used.", 404);
//       }

//       // Check if OTP is expired
//       const otpCreated = new Date(otp.created).getTime();
//       if (Date.now() - otpCreated > 2400000) { // 24 minutes expiration time
//         throw new AppError("Sign Up time expired.", 403);
//       }

//       // Check if OTP key is a string
//       if (typeof otp_key !== 'string') {
//         throw new AppError("Invalid OTP format.", 400);
//       }

//       // Compare provided OTP with the OTP from the database
//       if (!bcrypt.compareSync(otp_key, otp.otp_key)) {
//         throw new AppError("Wrong OTP.", 403);
//       }

//       // Mark OTP as used
//       otp.used = true;
//       await otp.save();
//     } else {
//       // If user not found, OTP verification is still required
//       if (!otp_key) {
//         throw new AppError("OTP is required, first send OTP", 400);
//       }

//       let otp;

//       if (email) {
//         // Find the latest unused OTP for the provided email
//         otp = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
//       } else {
//         // Find the latest unused OTP for the provided mobile number
//         otp = await Otp.findOne({ mobileNumber, used: false }).sort({ createdAt: -1 });
//       }

//       // If no unused OTP found, return error
//       if (!otp) {
//         throw new AppError("OTP not found or already used.", 404);
//       }

//       // Check if OTP is expired
//       const otpCreated = new Date(otp.created).getTime();
//       if (Date.now() - otpCreated > 2400000) { // 24 minutes expiration time
//         throw new AppError("Sign Up time expired.", 403);
//       }

//       // Check if OTP key is a string
//       if (typeof otp_key !== 'string') {
//         throw new AppError("Invalid OTP format.", 400);
//       }

//       // Compare provided OTP with the OTP from the database
//       if (!bcrypt.compareSync(otp_key, otp.otp_key)) {
//         throw new AppError("Wrong OTP.", 403);
//       }

//       // Mark OTP as used
//       otp.used = true;
//       await otp.save();

//       // Create a new user if email is provided
//       if (email) {
//         user = await User.create({ email, role: "user" });
//       }
//       if (mobileNumber) {
//         user = await User.create({ mobileNumber, role: "user" });
//       }
//     }

//     // Generate JWT token
//     const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey, { expiresIn: "15d" });

//     // Send success response with token and user information
//     res.status(200).json({
//       success: true,
//       message: "Successfully logged in!",
//       token,
//       user,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


exports.authenticateUserWithOtp = async (req, res, next) => {
  const { mobileNumber, email, otp_key } = req.body;

  // Check if either email or mobile number is provided
  if (!email && !mobileNumber) {
    return next(new AppError("Email or mobile number is required.", 400));
  }

  try {
    let user;

    // Check if user exists by email or mobile number
    if (email) {
      user = await User.findOne({ email,activestatus:true });
    } 


    // If user is not found, return an error
    if (!user) {
      return next(new AppError("User not found. Please sign up first.", 404));
    }
    const role = user.role?user.role:null

    // Check if OTP key is provided
    if (!otp_key) {
      return next(new AppError("OTP is required for verification.", 400));
    }

    let otp;

    if (email) {
      // Find the latest unused OTP for the provided email
      otp = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
    } else {
      // Find the latest unused OTP for the provided mobile number
      otp = await Otp.findOne({ mobileNumber, used: false }).sort({ createdAt: -1 });
    }

    // If no unused OTP found, return error
    if (!otp) {
      return next(new AppError("OTP not found or already used.", 404));
    }

    // Check if OTP is expired
    const otpCreated = new Date(otp.created).getTime();
    if (Date.now() - otpCreated > 2400000) { // 24 minutes expiration time
      return next(new AppError("Sign Up time expired.", 403));
    }

    // Check if OTP key is a string
    if (typeof otp_key !== 'string') {
      return next(new AppError("Invalid OTP format.", 400));
    }

    // Compare provided OTP with the OTP from the database
    if (!bcrypt.compareSync(otp_key, otp.otp_key)) {
      return next(new AppError("Wrong OTP.", 403));
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    // Generate JWT token
    const token = jwt.sign({ _id: user._id,role}, authKeys.jwtSecretKey, { expiresIn: "15d" });

    // Send success response with token and user information
    res.status(200).json({
      success: true,
      message: "Successfully logged in!",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};


exports.commonAuthenticateUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new AppError("invalid email or password.", 401));
      }
      const { email, password } = req.body;

      const userFromDB = await User.findOne({ email });
      const role = userFromDB.role
      if (role === "stylish") {

        if (!userFromDB || userFromDB.email !== email) {
          return next(new AppError("Invalid email", 400));
        }


        const token = jwt.sign({ _id: user._id, role }, authKeys.jwtSecretKey, { expiresIn: '15d' });

        // console.log(colorizeText("User Email logged in :", "yellow"), colorizeText(userFromDB.email, 'blue'));
        // const sms = await sendSMS(`You are successfully logged in. If not you, please contact admin support.`, `91${userFromDB?.mobileNumber}`, "Lovoj");
        return res.status(200).json({
          success: true,
          message: "Successfully logged in!",
          token: token,
          user: userFromDB,
        });
      } else {
        return next(new AppError("Role is not defined!", 401));
      }
    } catch (error) {
      console.log(error);
      return next(new AppError("Server error", 500));
    }
  })(req, res, next);
};








