import SingleBusinessPermit from '../models/SingleBusinessPermit.js'

// Create a new business registration
export const createBusiness = async (req, res) => {
  try {
    const businessData = req.body;
    const newBusiness = new SingleBusinessPermit(businessData);
    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create a new business.' });
  }
};

// Retrieve all businesses
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await SingleBusinessPermit.find();
    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve businesses.' });
  }
};

// Retrieve a single business by its ID
export const getBusinessById = async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await SingleBusinessPermit.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }
    res.json(business);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve the business.' });
  }
};

// Update a business by its ID
export const updateBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const businessData = req.body;
    const updatedBusiness = await SingleBusinessPermit.findByIdAndUpdate(
      businessId,
      businessData,
      { new: true }
    );
    if (!updatedBusiness) {
      return res.status(404).json({ error: 'Business not found.' });
    }
    res.json(updatedBusiness);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update the business.' });
  }
};

// Delete a business by its ID
export const deleteBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const deletedBusiness = await SingleBusinessPermit.findByIdAndDelete(businessId);
    if (!deletedBusiness) {
      return res.status(404).json({ error: 'Business not found.' });
    }
    res.json({ message: 'Business deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete the business.' });
  }
};

// export default {
//   createBusiness,
//   getAllBusinesses,
//   getBusinessById,
//   updateBusiness,
//   deleteBusiness,
// };
