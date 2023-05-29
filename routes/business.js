import express from "express";
import {
  getAllBuildingBusinesses,
  getAllCountyBusinesses,
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  changePaymentStatus,
  getWardBusinesses
} from "../controllers/business.js";

const router = express.Router();

router.post("/register", createBusiness);
router.get("/businesses", getAllBusinesses);
router.get("/businesses/:id", getAllBuildingBusinesses);
router.get("/businesses/:county", getAllCountyBusinesses);
router.get("/businesses/ward/:ward", getWardBusinesses);
router.get("/business/:id", getBusinessById);
// app.put('/update/:id/payment-status', checkAdminOrOfficer, changePaymentStatus);
router.put('/update/:id/payment-status', changePaymentStatus);
router.put("/update/:id", updateBusiness);
router.delete("/delete:/id", deleteBusiness);

export default router;