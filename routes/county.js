import express from "express";

import {
    createCounty,
    getAllCounties,
    getCountyById,
    updateCountyById,
    deleteCountyById,
} from "../controllers/county.js";

import {
    createSubCounty,
    getAllSubCounties,
    getSubCountyById,
    updateSubCountyById,
    deleteSubCountyById,
} from "../controllers/subcounty.js"

import {
    createWard,
    getAllWards,
    getWardById,
    updateWardById,
    deleteWardById,
    getWardSummariesView,
} from "../controllers/ward.js";

const router = express.Router();

// County Routes
// Create a new county
router.post("/counties", createCounty);

// Get all counties
router.get("/counties", getAllCounties);

// Get a specific county by ID
router.get("/counties/:countyId", getCountyById);

// Update a county by ID
router.put("/counties/:countyId", updateCountyById);

// Delete a county by ID
router.delete("/counties/:countyId", deleteCountyById);

// Subcounty routes
// Create a new subcounty
router.post("/subcounties", createSubCounty);

// Get all subcounties
router.get("/subcounties", getAllSubCounties);

// Get a specific subcounty by ID
router.get("/subcounties/:subCountyId", getSubCountyById);

// Update a subcounty by ID
router.put("/subcounties/:subCountyId", updateSubCountyById);

// Delete a subcounty by ID
router.delete("/subcounties/:subCountyId", deleteSubCountyById);

// Wards routes
// Create a new ward
router.post("/wards", createWard);

// Get all wards
router.get("/wards", getAllWards);

// Get a specific ward by ID
router.get("/wards/:wardId", getWardById);

// Update a ward by ID
router.put("/wards/:wardId", updateWardById);

// Delete a ward by ID
router.delete("/wards/:wardId", deleteWardById);

router.get('/summaries', getWardSummariesView)

export default router;