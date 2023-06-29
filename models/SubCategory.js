import mongoose, { Schema } from "mongoose";

const subCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: Number,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
