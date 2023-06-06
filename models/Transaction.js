import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    cost: String,
    products: {
      type: [mongoose.Types.ObjectId],
      of: Number,
      ref: "Product",
    },
    receipt_no: String,
    store: {
      type: Schema.Types.ObjectId,
      ref: "SingleBusinessPermit",
    },
  },
  { timestamps: true }
);

TransactionSchema.plugin(mongoosePaginate);
const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
