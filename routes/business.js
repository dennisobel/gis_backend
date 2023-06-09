import express from "express";
import {
  createBusiness,
  getAllBusinesses,
  getAllBuildingBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  getAllCountyBusinesses,
  escalateBusiness,
  changePaymentStatus,
  uploadBusinessImage,
  getImage,
  verifyBusiness
} from "../controllers/business.js";
import { upload } from "./helpers.js";

const router = express.Router();

router.post("/register", createBusiness);
router.get("/businesses", getAllBusinesses);
router.get("/businesses/:id", getAllBuildingBusinesses);
router.get("/county-businesses/:county", getAllCountyBusinesses);
router.get("/business/:id", getBusinessById);
// app.put('/update/:id/payment-status', checkAdminOrOfficer, changePaymentStatus);
router.put('/update/:id/payment-status', changePaymentStatus);
router.put("/update/:id", updateBusiness);
router.delete("/delete:/id", deleteBusiness);
router.post("/escalation", escalateBusiness)
router.post("/upload", upload.single('image'), uploadBusinessImage)
router.get("/image/:id", getImage)
router.post("/verify", verifyBusiness)

export default router;