import express from "express";
import { getBuildings, getBuildingById, getAllCountyBuildings } from "../controllers/building.js";

const router = express.Router();

router.get("/", getBuildings);
router.get("/:id", getBuildingById);
router.get("/by-county/:county", getAllCountyBuildings);

export default router;
