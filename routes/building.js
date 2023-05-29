import express from "express";

import { getBuildings, getBuildingById, getCountyBuildings, getAllCountyBuildings, getAllWardBuildings } from "../controllers/building.js";

const router = express.Router();

router.get("/", getBuildings);
router.get("/:id", getBuildingById);

router.get("/by-county/:county", getAllCountyBuildings);

router.get("/buildings/:county", getCountyBuildings);
router.get("/ward/:ward", getAllWardBuildings);


export default router;
