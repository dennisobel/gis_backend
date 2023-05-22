import mongoose from "mongoose";

const CountySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 120,
    },
    code: {
        type: String,
        required: true
    }
    
  },
  {
    timestamps: true,
  }
);

const County = mongoose.model("County", CountySchema);
export default County;
