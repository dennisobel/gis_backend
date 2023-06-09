import mongoose, { Schema } from "mongoose";

const subCategorySchema = mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", subCategorySchema);

export default Image;
