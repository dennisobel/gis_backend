import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 120,
    },
    email: {
      type: String,
      required: true,
      max: 120,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    msisdn: {
      type: String,
      required: true,
    },
    id_number: {
      type: String,
      required: true,
    },
    user_type: {
      type: String,
      required: true,
    },
    kra_brs_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["governor", "cec", "director", "revenueOfficer", "management"],
      default: "governor",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
