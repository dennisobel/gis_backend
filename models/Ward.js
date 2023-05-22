import mongoose from "mongoose";

const WardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 120,
    },
    
  },
  {
    timestamps: true,
  }
);

const Ward = mongoose.model("Ward", WardSchema);
export default Ward;
