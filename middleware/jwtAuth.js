const passport = require("passport");
const jwt = require("jsonwebtoken");
const Store = require("../models/stores");
const authKeys = require("../middleware/authKeys");
const { catchAsyncError } = require("./catchAsyncError");
const User = require('../models/user')
const AppError = require("../utils/errorHandler");

// const jwtAuth = catchAsyncError((req, res, next) => {
//   passport.authenticate("jwt", { session: false }, function (err, user, info) {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       res.status(401).json(info);
//       return;
//     }

//     req.user = user;
//     // console.log(req.user)
//     next();
//   })(req, res, next);
// })


const jwtAuth = catchAsyncError((req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      const response = {
        success: false,
        // message: "Token expired or invalid.",
        ...info
      };
      res.status(401).json(response);
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
});


const jwtAuthAdmin = catchAsyncError(async(req, res, next) => {
  passport.authenticate("jwt", { session: false },async function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }
    req.user = user;
    if (err) return next(err);
    if (!user) return res.status(401).json(info);

    req.user = user;
    console.log(req.user)
    if (req.user.role === "superadmin" || req.user.role === "admin") {
      if(req.user.role=='superadmin'){
        let admin_id = req.body.admin_id

        if(!admin_id){
          admin_id = req.user._id
          // return res.status(404).send("admin_id needed")
        }

        const adminUser = await User.findOne({ _id: admin_id });
        req.user = adminUser
      }
    }


    if (req.user.storeId) {
      req.user.storeInfo = await Store.findById(user.storeId);
    }
    
    if (req.user.role === "admin"||req.user.role === "superadmin") {
      next();
    } else {
      return next(new AppError("Access denied. Admin privileges required.", 403));
    }
  })(req, res, next);
})

const jwtAuthAdminandUser = catchAsyncError((req, res, next) => {
  passport.authenticate("AdminandUser", { session: false, passReqToCallback: true }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }
    req.user = user;

    if (req.user.role === "user" || req.user.role === "admin"||req.user.role==='superadmin') {
      // User is either a user or an admin
      next();
    } else {
      return next(new AppError("Access denied. Insufficient privileges.", 403));
    }
  })(req, res, next);
});


const jwtAuthSuperAdmin = catchAsyncError((req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }

    req.user = user;

    if (req.user.role === "superadmin") {
      // User is an superadmin
      next();
    } else {
      return next(new AppError("Access denied. SuperAdmin privileges required.", 403));
    }
  })(req, res, next);
})


const jwtAuthWorker = catchAsyncError((req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }

    req.user = user;

    if (req.user.role !== "admin") {
      // User is a worker
      next();
    } else {
      return next(new AppError("Access denied. Worker privileges required.", 403));
    }
  })(req, res, next);
})
const jwtAuthAdminManager = catchAsyncError((req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }

    req.user = user;

    if (["admin", "cutter", "manager", "sales"].includes(req.user.role)) {
      // User is a worker
      next();
    } else {
      return next(new AppError("Access denied. Admin or manager privileges required.", 403));
    }
  })(req, res, next);
})

const generateToken = (payload, expiresIn) => {

  return jwt.sign(payload, authKeys.jwtSecretKey, { expiresIn });
};

const authorizeAdmin = catchAsyncError((req, res, next) => {
  if (req.user.role !== "superadmin")
  return next(new AppError(`${req.user.role} is not allowed to access this resource`, 403));

  next();
})

const superAdminPermission = catchAsyncError((req, res, next) => {
  if(req.user.superAdminPermission !== true) 
    return next(new AppError(`${req.user.role} is not allowed to access this resource`, 403));
 
    next();
})


const jwtAuthCommon = catchAsyncError((req, res, next) => {
  // passport.authenticate("jwt", { session: false }, function (err, user, info) {
    passport.authenticate("jwtAuthCommon", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }

    req.user = user;

    if (req.user.role === "stylish") {
      // User is an stylish
      next();
    } else {
      return next(new AppError("Access denied. Stylish privileges required.", 403));
    }
  })(req, res, next);
})



const jwtAuthAdminWorker = catchAsyncError((req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json(info);
      return;
    }

    req.user = user;

    if (["admin","cutter","mastertailor","stitching","QC", "delivery","manager","sales"].includes(req.user.role)) {

      // User is a worker
      next();
    } else {
      return next(new AppError("Access denied. Admin or Worker privileges required.", 403));
    }
  })(req, res, next);
})

const jwtAuthSuperAdminOrStylist = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);

    req.user = user;
    if (req.user.role === "superadmin" || req.user.role === "stylish") {
      // Allow access for both roles
      return next();
    } else {
      return next(new AppError("Access denied. SuperAdmin or Stylish privileges required.", 403));
    }
  })(req, res, next);
};
module.exports = { jwtAuth, generateToken, authorizeAdmin, jwtAuthAdmin, jwtAuthWorker, jwtAuthSuperAdmin, jwtAuthAdminandUser, jwtAuthAdminManager,jwtAuthAdminWorker, superAdminPermission,jwtAuthCommon,jwtAuthSuperAdminOrStylist };



