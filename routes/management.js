import express from "express";
import { assignWardToOfficer, getAdmins, getUserPerformance } from "../controllers/management.js";

const router = express.Router();

router.get("/admins", getAdmins);
router.get("/performance/:id", getUserPerformance);
router.post("/assign_officer", assignWardToOfficer); 
export default router;