const mongoose = require("mongoose");

const DesignInquirySchema = new mongoose.Schema(
  {
    design_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomDesign",
      required: true,
    },
    desginer_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"customer_addresses",
      required: true,
    },
    product_pricing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductPricing",
      required: true,
    },
    product_shipping_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductShipping",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a 2dsphere index for geospatial queries
DesignInquirySchema.index({ location: "2dsphere" });

const DesignInquiry = mongoose.model("DesignInquiry", DesignInquirySchema);

module.exports = DesignInquiry;
