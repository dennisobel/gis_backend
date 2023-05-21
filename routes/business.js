import express from "express";
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
} from "../controllers/business.js";

const router = express.Router();

router.post("/register", createBusiness);
router.get("/businesses", getAllBusinesses);
router.get("/business/:id", getBusinessById);
router.put("/update/:id", updateBusiness);
router.delete("/delete:/id", deleteBusiness);

export default router;