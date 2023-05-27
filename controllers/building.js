import mongoose from "mongoose";
import Building from "../models/Building.js";
import SingleBusinessPermit from "../models/SingleBusinessPermit.js";

// Create a new building
export const createBuilding = async (req, res) => {
  try {
    const buildingData = req.body;
    const building = new Building(buildingData);
    const newBuilding = await building.save();
    res.status(201).json(newBuilding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all buildings
export const getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find();
    res.status(200).json(buildings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all county buildings
export const getAllCountyBuildings = async (req, res) => {
  const county = req.params.county;
  try {
    const buildings = await Building.aggregate([
      { $match: { county } },
      {
        $lookup: {
          from: "singlebusinesspermits",
          localField: "_id",
          foreignField: "building",
          as: "singleBusinessPermits",
        },
      },
    ]);

    res.status(200).json(buildings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read a specific building by ID
export const getBuildingById = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.status(200).json(building);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a building
export const updateBuildingById = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const updatedData = req.body;
    const updatedBuilding = await Building.findByIdAndUpdate(
      buildingId,
      updatedData,
      { new: true }
    );
    if (!updatedBuilding) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.status(200).json(updatedBuilding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a building
export const deleteBuildingById = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const deletedBuilding = await Building.findByIdAndDelete(buildingId);
    if (!deletedBuilding) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.status(200).json({ message: "Building deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
