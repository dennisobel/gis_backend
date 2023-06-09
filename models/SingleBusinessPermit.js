import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const SingleBusinessPermitSchema = new mongoose.Schema({
  application_type: String,
  registered: String,
  business_name: {
    type: String,
    required: false,
  },
  branch_name: {
    type: String,
    required: false,
  },

  floor_no: String,
  store_no: {
    type: String,
    required: true,
    unique: true,
  },
  business_category: String,
  business_sub_category: {
    type: String,
    required: false,
  },
  business_description: String,
  no_of_employees: {
    type: Number,
    required: false,
  },
  additional_activity: {
    type: String,
    required: false,
  },
  premise_size: {
    type: String,
    required: false,
  },
  business_email: {
    type: String,
    required: false,
  },
  business_phone: {
    type: String,
    required: false,
  },
  postal_address: {
    type: String,
    required: false,
  },
  postal_code: {
    type: String,
    required: false,
  },
  payment_status: {
    type: String,
    enum: ["Paid", "Partially Paid", "Not Paid"],
    default: "Not Paid",
  },
  is_building_open: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
    required: false,
  },
  escalated: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verified_by: { type: Schema.Types.ObjectId, ref: "User", required: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: "Image",
  },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  building: { type: Schema.Types.ObjectId, ref: "Building" },
});

SingleBusinessPermitSchema.index({
  business_category: 1,
  "building.street": "text",
  "building.county": 1,
});

SingleBusinessPermitSchema.plugin(mongoosePaginate);
const SingleBusinessPermit = mongoose.model(
  "SingleBusinessPermit",
  SingleBusinessPermitSchema
);

export default SingleBusinessPermit;
