import mongoose, { Schema } from "mongoose";

const targetSchema = mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      unique: true,
    },
    officer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ward: String, 
    amount: Number,
  },
  { timestamps: true }
);

const Target = mongoose.model("Target", targetSchema);

export default Target;
