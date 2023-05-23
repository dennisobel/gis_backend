import mongoose, {Schema} from "mongoose";

const SubCountySchema = new mongoose.Schema(
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
    },
    county: { type: Schema.Types.ObjectId, ref: 'County' }    
  },
  {
    timestamps: true,
  }
);

const SubCounty = mongoose.model("SubCounty", SubCountySchema);
export default SubCounty;
