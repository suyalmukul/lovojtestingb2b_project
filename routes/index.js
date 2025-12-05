const express = require("express");
const authRouter = require("./authRoutes");
const { personalDetRouter, businessDetRouter, profileDetRouter, signatureDetRouter, changePassDetRouter, factoryProfileDetRouter, allgetprofileDetRouter, sendRequestDetRouter, acceptRequestDetRouter } = require("./profileRoutes");
const fabricRouter = require("./fabricRoutes");
const quickOrderRouter = require("./quickOrderRoute");
const superAdminRouter = require("./superAdminRoutes");
const designerRouter = require("./designerRoutes");
const workerRouter = require("./workerRoute");
const testRouter = require("./testRoute");
const otherRouter = require("./otherRoutes");
const onBoardRouter = require("./onBoardingRoutes");
const customerRouter = require("./customerRoutes");
const cartRouter = require("./cartRoutes");
const QuickOrderSetupRouter = require("./QuickOrderSetupRoutes")
const NewQuickOrderSetupRouter = require("./QuickOrderSetup_NewRoutes")
const NewQuickOrderSetupUserRouter = require("./QuickOrderSetup_NewRoutesUser")
const settingRouter = require("./settingsRoute");
const paymentRouter = require("./paymentRoutes");
const uploadOrderRouter = require("./uplodDesignDataRoute");
const timeSlotRouter = require("./timeSlotRoute");
const stylistRouter = require("./stylistRoute");
settingRouter
// const orderRouter = require("./testOrderRoute")
const allRoutes = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/secure",
    route: paymentRouter,
  },
  {
    path: "/profile",
    route: personalDetRouter,
  },
  {
    path: "/profile",
    route: businessDetRouter,
  },
  {
    path: "/profile",
    route: profileDetRouter,
  },
  {
    path: "/profile",
    route: signatureDetRouter,
  },
  {
    path: "/profile",
    route: changePassDetRouter,
  },
  {
    path: "/profile",
    route: factoryProfileDetRouter,
  },
  {
    path: "/profile",
    route: allgetprofileDetRouter,
  },
  {
    path: "/profile",
    route: sendRequestDetRouter,
  },
  {
    path: "/profile",
    route: acceptRequestDetRouter,
  },

  {
    path: "/fabric",
    route: fabricRouter,
  },
  {
    path: "/quick",
    route: quickOrderRouter,
  },
  {
    path: "/superadmin",
    route: superAdminRouter,
  },
  {
    path: "/worker",
    route: workerRouter,
  },
  {
    path: "/test",
    route: testRouter,
  },
  {
    path: "/landing",
    route: otherRouter,
  },
  {
    path: "/onboard",
    route: onBoardRouter,
  },
  {
    path: "/customer",
    route: customerRouter,
  },
  // {
  //   path: "/order",
  //   route: orderRouter,
  // },

  {
    path: "/cart",
    route: cartRouter,
  },

  {
    path: "/Setup",
    route: QuickOrderSetupRouter,
  },

  {
    path: "/Setups",
    route: NewQuickOrderSetupRouter,
  },
  {
    path: "/SetupsforUser",
    route: NewQuickOrderSetupUserRouter,
  },

  {
    path: "/store",
    route: settingRouter,
  },

  {
    path: "/uploadDesign",
    route: uploadOrderRouter,
  },
  {
    path: "/time-slot",
    route: timeSlotRouter,
  },

  {
    path: "/stylist",
    route: stylistRouter,
  },
  {
    path: "/designer",
    route: designerRouter
  },
  // {
  //   path: "/designer",
  //   route: productRouter
  // }


];

defaultRoutes.forEach((route) => {
  allRoutes.use(route.path, route.route);
});

module.exports = allRoutes;