import mongoose, { Schema } from "mongoose";

const WardSummarySchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
    },
    ward: { type: Schema.Types.ObjectId, ref: "Ward" },
    month_balance: Number,
    quarter_balance: Number,
    year_balance: Number,
    month_paid: Number,
    yearly_paid: Number,
    total_paid: Number,
    paid_businesses: Number,
    not_paid_businesses: Number,
    partially_paid_businesses: Number,
  },
  {
    timestamps: true,
  }
);

const WardSummary = mongoose.model("WardSummary", WardSummarySchema);
export default WardSummary;
