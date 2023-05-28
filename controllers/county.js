import County from "../models/County.js";

export const createCounty = async (req, res) => {
  try {
    const countyData = req.body;
    const county = new County(countyData);
    const newCounty = await county.save();
    return res.status(201).json(newCounty);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllCounties = async (req, res) => {
  try {
    const counties = await County.find();
    return res.status(200).json(counties);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getCountyById = async (req, res) => {
  try {
    const { countyId } = req.params;
    const county = await County.findById(countyId);
    if (!county) {
      return res.status(404).json({ error: "County not found" });
    }
    return res.status(200).json(county);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateCountyById = async (req, res) => {
  try {
    const { countyId } = req.params;
    const updatedData = req.body;
    const updatedCounty = await County.findByIdAndUpdate(
      countyId,
      updatedData,
      { new: true }
    );
    if (!updatedCounty) {
      return res.status(404).json({ error: "County not found" });
    }
    return res.status(200).json(updatedCounty);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteCountyById = async (req, res) => {
  try {
    const { countyId } = req.params;
    const deletedCounty = await County.findByIdAndDelete(countyId);
    if (!deletedCounty) {
      return res.status(404).json({ error: "County not found" });
    }
    return res.status(200).json({ message: "County deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


