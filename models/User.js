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
      required: false,
    },
    kra_brs_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["governor", "cec", "director", "revenueOfficer", "management","client"],
      default: "",
    },
    ministry: {
      type: String,
      required: false,
    },
    county_id: {
      type: String,
      required: false,
    },
    // block: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Ward',
    //   required: false,
    // }
    ward: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
