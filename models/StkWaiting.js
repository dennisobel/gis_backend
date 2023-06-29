import mongoose, { Schema } from "mongoose";

const StkWaitingSchema = new mongoose.Schema(
  {
    msisdn: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "SingleBusinessPermit",
    },
    fulfilled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const StkWaiting = mongoose.model("StkWaiting", StkWaitingSchema);
export default StkWaiting;
