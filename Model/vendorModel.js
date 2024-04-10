const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String
    },
    role: { type: String, enum: ["subDealer"], default: "subDealer" },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dealer",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor' // This should match the model name of your Vendor
    }
  },

  {
    timestamps: true,
  }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
