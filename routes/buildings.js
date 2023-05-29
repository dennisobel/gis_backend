import express from "express";
import {
  createBuilding,
  getAllBuildings,
  getCountyBuildings,
  getBuildingById,
  updateBuildingById,
  deleteBuildingById,
} from "../controllers/building.js";

const router = express.Router();

router.post("/create", createBuilding);
router.get("/buildings", getAllBuildings);
router.get("/buildings/:county", getCountyBuildings);
router.get("/building/:id", getBuildingById);
router.put("/update/:id", updateBuildingById);
router.delete("/delete:/id", deleteBuildingById);

export default router;