import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const TransactionSchema = new mongoose.Schema(
  {
    msisdn: String,
    cost: String,
    receipt_no: String,
    store: {
      type: Schema.Types.ObjectId,
      ref: "SingleBusinessPermit",
    },
    transaction_date: String,
    request_dump: String,
  },
  { timestamps: true }
);

TransactionSchema.plugin(mongoosePaginate);
const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
