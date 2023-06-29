import mongoose, { Schema } from "mongoose";
import LocationSchema from "./Location.js";

const EscalationSchema = new mongoose.Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "SingleBusinessPermit",
    },
    escalated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
    },
    attended_to: {
      type: Boolean,
      default: false,
    },
    location: {
      type: LocationSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Escalation = mongoose.model("Escalation", EscalationSchema);
export default Escalation;
