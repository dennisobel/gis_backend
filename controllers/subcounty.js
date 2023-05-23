import mongoose from "mongoose";
import SubCounty from "../models/SubCounty.js";

// Create a new subcounty
export const createSubCounty = async (req, res) => {
  try {
    const subCountyData = req.body;
    const subCounty = new SubCounty(subCountyData);
    const newSubCounty = await subCounty.save();
    res.status(201).json(newSubCounty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all SubCounties
export const getAllSubCounties = async (req, res) => {
  try {
    const subCounties = await SubCounty.find().populate("county");
    res.status(200).json(subCounties);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read a specific subcounty by ID
export const getSubCountyById = async (req, res) => {
  try {
    const { subCountyId } = req.params;
    const subCounty = await SubCounty.findById(subCountyId).populate("county");
    if (!subCounty) {
      return res.status(404).json({ error: "SubCounty not found" });
    }
    res.status(200).json(subCounty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a SubCounty
export const updateSubCountyById = async (req, res) => {
  try {
    const { subCountyId } = req.params;
    const updatedData = req.body;
    const updatedSubCounty = await SubCounty.findByIdAndUpdate(
      subCountyId,
      updatedData,
      { new: true }
    );
    if (!updatedSubCounty) {
      return res.status(404).json({ error: "SubCounty not found" });
    }
    res.status(200).json(updatedSubCounty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a SubCounty
export const deleteSubCountyById = async (req, res) => {
  try {
    const { subCountyId } = req.params;
    const deletedSubCounty = await SubCounty.findByIdAndDelete(subCountyId);
    if (!deletedSubCounty) {
      return res.status(404).json({ error: "SubCounty not found" });
    }
    res.status(200).json({ message: "SubCounty deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

