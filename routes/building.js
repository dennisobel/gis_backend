import express from "express";
import { getBuildings, getBuildingById, getAllCountyBuildings,getAllWardBuildings } from "../controllers/building.js";

const router = express.Router();

router.get("/", getBuildings);
router.get("/:id", getBuildingById);
router.get("/buildings/:county", getAllCountyBuildings);
router.get("/ward/:ward", getAllWardBuildings);

export default router;
