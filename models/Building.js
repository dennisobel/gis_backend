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
    paid_count: {
      type: Number,
      required: false,
    },
    not_paid_count: {
      type: Number,
      required: false,
    },
    partially_paid_count: {
      type: Number,
      required: false,
    },
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

BuildingSchema.index({ county: 1, ward: 1 });

BuildingSchema.plugin(mongoosePaginate);
const Building = mongoose.model("Building", BuildingSchema);
export default Building;
