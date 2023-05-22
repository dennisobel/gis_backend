import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    msisdn: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
    },
    expiry: {
      type: Number,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
