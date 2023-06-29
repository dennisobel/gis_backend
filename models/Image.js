import mongoose, { Schema } from "mongoose";

const subCategorySchema = mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false
    }
    
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", subCategorySchema);

export default Image;
