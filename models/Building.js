import mongoose, { Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const BuildingSchema = new mongoose.Schema(
  {
    building_number: {
      type: String,
      required: true,
    },
    floors: Number,
    type_of_structure: String,
    street: String,
    description: String,
    county: String,
    sub_county: String,
    ward: String,
    longitude: String,
    latitude: String,
    singleBusinessPermits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SingleBusinessPermit',
      },
    ],
  },
  {
    timestamps: true,
  }
);

BuildingSchema.plugin(mongoosePaginate);
const Building = mongoose.model("Building", BuildingSchema);
export default Building;
