const express = require("express");
const onBoardRouter = express.Router();
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const {
  appraelController,
  UpdateAllonBoardContent,
  creditLimitController,
  UpdateCreditContent,
  fastdeliveryController,
  getAllOnBoardContent,
  UpdateFastDeliveryContent,
} = require("../controllers/onBoardingController");

onBoardRouter.post(
  "/addingappraelcontent",
  upload.fields([
    {
      name: "appraelImages",
      maxCount: 1,
    },
  ]),
  appraelController
);

onBoardRouter.put(
  "/addingappraelcontent",
  upload.fields([
    {
      name: "appraelImages",
      maxCount: 1,
    },
  ]),
  UpdateAllonBoardContent
);

onBoardRouter.post(
  "/addingcreditcontent",
  upload.fields([
    {
      name: "creditLimitImages",
      maxCount: 1,
    },
  ]),
  creditLimitController
);

onBoardRouter.put(
  "/addingcreditcontent",
  upload.fields([
    {
      name: "creditLimitImages",
      maxCount: 1,
    },
  ]),
  UpdateCreditContent
);

onBoardRouter.post(
  "/addingfastdeliverycontent",
  upload.fields([
    {
      name: "fastDeliveryImages",
      maxCount: 1,
    },
  ]),
  fastdeliveryController
);

onBoardRouter.put(
  "/addingfastdeliverycontent",
  upload.fields([
    {
      name: "fastDeliveryImages",
      maxCount: 1,
    },
  ]),
  UpdateFastDeliveryContent
);
onBoardRouter.get("/fetchingAllOnboardingContent", getAllOnBoardContent);
module.exports = onBoardRouter;
