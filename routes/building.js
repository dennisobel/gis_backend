import express from "express";
import { getBuildings, getBuildingById } from "../controllers/building.js";

const router = express.Router();

router.get("/", getBuildings);
router.get("/:id", getBuildingById);

export default router;
