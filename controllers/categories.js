import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";

// Read all wards
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().select("name");
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Read all wards
export const getCategoriesData = async (req, res) => {
  try {
    const categories = await Category.find().populate("sub_categories");
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Read all wards
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const categories = await SubCategory.find({category: id}).select('name price')
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
