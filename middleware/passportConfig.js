const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Workers = require("../models/Worker.model");

const User = require("../models/user");
const authKeys = require("./authKeys");
const CustomerOnline = require("../models/Customerb2c.online");
const { default: axios } = require("axios");
const OnlineCustomers = require("../models/OnlineCustomers.model");

const filterJson = (obj, unwantedKeys) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (unwantedKeys?.indexOf(key) === -1) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

passport.use(
  new Strategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    (req, email, password, done, res) => {
      // Check if the role is one of the specified roles

      const isWorkerRole =
        req.body.role === "manager" ||
        req.body.role === "sales" ||
        req.body.role === "cutter" ||
        req.body.role === "mastertailor" ||
        req.body.role === "stitching" ||
        req.body.role === "QC" ||
        req.body.role === "accessories" ||
        req.body.role === "delivery";

      if (isWorkerRole) {
        Workers.findOne({ email: email }, "+password", (err, worker) => {
          if (err) {
            return done(err);
          }
          if (!worker) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          worker
            .login(password)
            .then(() => {
              worker["_doc"] = filterJson(worker["_doc"], ["password", "__v"]);
              return done(null, worker);
            })
            .catch((err) => {
              return done(err, false, {
                message: "Invalid email or password",
              });
            });
        });
      } else {
        User.findOne({ email: email }, "+password", (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          user
            .login(password)
            .then(() => {
              user["_doc"] = filterJson(user["_doc"], ["password", "__v"]);
              return done(null, user);
            })
            .catch((err) => {
              return done(err, false, {
                message: "Invalid email or password",
              });
            });
        });
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: authKeys.jwtSecretKey,
    },
    async (jwt_payload, done) => {
      const user = await User.findById(jwt_payload._id);
      if (user) {
        user["_doc"] = filterJson(user["_doc"], ["password", "__v"]);
        return done(null, user);
      }

      const worker = await Workers.findById(jwt_payload._id);
      if (worker) {
        worker["_doc"] = filterJson(worker["_doc"], ["password", "__v"]);
        return done(null, worker);
      }

      return done(null, false, {
        message: "Session Expired",
      });
    }
  )
);
passport.use("AdminandUser",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: authKeys.jwtSecretKey,
      passReqToCallback: true
    },
    async (req, jwt_payload, done) => {
      try {
        let user = await User.findById(jwt_payload._id);

        if (user) {
          user["_doc"] = filterJson(user["_doc"], ["password", "__v"]);
          return done(null, user);
        }

        const onlineCustomer = await OnlineCustomers.findById(jwt_payload._id);

        // If user is not found in the local database, check the external API
        // const response = await axios.get(`${process.env.B2C_URL}/api/v1/auth/customer/me`, {
        //   headers: {
        //     Authorization: req.headers.authorization
        //   }
        // });

        const userData = onlineCustomer;


        return done(null, userData);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);


passport.use(
  "customerB2C-local",
  new Strategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      // Find the user by email in the CustomerB2C collection
      CustomerOnline.findOne({ email: email }, "+password", (err, customer) => {
        if (err) {
          return done(err);
        }
        if (!customer) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        customer
          .login(password)
          .then(() => {
            customer["_doc"] = filterJson(customer["_doc"], ["password", "__v"]);
            return done(null, customer);
          })
          .catch((err) => {
            return done(err, false, {
              message: "Invalid email or password",
            });
          });
      });
    }
  )
);


passport.use("jwtAuthCommon",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: authKeys.jwtSecretKey,
    },
    async (jwt_payload, done) => {
      const user = await User.findById(jwt_payload._id);
      if (user && user.role === "stylish") {
        user["_doc"] = filterJson(user["_doc"], ["password", "__v"]);
        return done(null, user);
      }

      return done(null, false, {
        message: "Access denied. Stylish privileges required.",
      });
    }
  )
);



module.exports = passport;
