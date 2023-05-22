import mongoose from "mongoose";
import Ward from "../models/Ward.js";

// Create a new ward
export const createWard = async (req, res) => {
  try {
    const wardData = req.body;
    const ward = new Ward(wardData);
    const newWard = await ward.save();
    res.status(201).json(newWard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all wards
export const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find().populate("subCounty");
    res.status(200).json(wards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read a specific ward by ID
export const getWardById = async (req, res) => {
  try {
    const { wardId } = req.params;
    const ward = await Ward.findById(wardId).populate("subCounty");
    if (!ward) {
      return res.status(404).json({ error: "Ward not found" });
    }
    res.status(200).json(ward);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a Ward
export const updateWardById = async (req, res) => {
  try {
    const { wardId } = req.params;
    const updatedData = req.body;
    const updatedWard = await Ward.findByIdAndUpdate(wardId, updatedData, {
      new: true,
    });
    if (!updatedWard) {
      return res.status(404).json({ error: "Ward not found" });
    }
    res.status(200).json(updatedWard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a Ward
export const deleteWardById = async (req, res) => {
  try {
    const { wardId } = req.params;
    const deletedWard = await Ward.findByIdAndDelete(wardId);
    if (!deletedWard) {
      return res.status(404).json({ error: "Ward not found" });
    }
    res.status(200).json({ message: "Ward deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
