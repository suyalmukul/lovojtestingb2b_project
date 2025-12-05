const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema({
  apparelImage: {
    type: String,
  },
  apparelHeading: {
    type: String,
  },
  apprarelSubHeading: {
    type: String,
  },

  creditLimitImage: {
    type: String,
  },
  creditLimitHeading: {
    type: String,
  },
  creditLimitSubHeading: {
    type: String,
  },

  fastDeliveryImage: {
    type: String,
  },
  fastDeliveryHeading: {
    type: String,
  },
  fastDeliverySubHeading: {
    type: String,
  },
}, { timestamps: true });

const onBoarding = mongoose.model("onBoarding", onboardingSchema);

module.exports = onBoarding;
