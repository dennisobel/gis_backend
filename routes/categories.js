import express from "express";
import {
  getCategoriesData, getCategoryById, getAllCategories
} from "../controllers/categories.js";

const router = express.Router();

router.get('', getAllCategories)
router.get("/all", getCategoriesData);
router.get("/:id", getCategoryById);

export default router;