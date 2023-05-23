import mongoose, {Schema} from "mongoose";

const WardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 120,
    },
    code: {
      type: String
    },
    subCounty: { type: Schema.Types.ObjectId, ref: 'SubCounty' },
  },
  {
    timestamps: true,
  }
);

const Ward = mongoose.model("Ward", WardSchema);
export default Ward;
