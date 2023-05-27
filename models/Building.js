import mongoose from "mongoose";

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
    
  },
  {
    timestamps: true,
  }
);

const Building = mongoose.model("Building", BuildingSchema);
export default Building;
