import SingleBusinessPermit from "../models/SingleBusinessPermit.js";
import Building from "../models/Building.js";

// Create a new business registration
export const createBusiness = async (req, res) => {
  try {
    const businessData = req.body;
    const newBusiness = new SingleBusinessPermit(businessData);
    const savedBusiness = await newBusiness.save();
    return res.status(201).json(savedBusiness);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create a new business." });
  }
};

// Retrieve all businesses
export const getAllBusinesses = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    // sortField = "createdAt",
    // sortOrder = "desc",
  } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const searchFilter = {};

  // if (building_number) {
  //   searchFilter.building_number = { $regex: building_number };
  // }
  // if (ward){
  //   searchFilter.ward = { $regex: ward, $options: "i" }
  // }

  try {
    const businesses = await SingleBusinessPermit.paginate(
      searchFilter,
      options
    );

    // const businesses = await SingleBusinessPermit.find();
    return res.status(200).json(businesses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to retrieve businesses." });
  }
};

// Retrieve a single business by its ID
export const getBusinessById = async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await SingleBusinessPermit.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found." });
    }
    res.json(business);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to retrieve the business." });
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
      return res.status(404).json({ error: "Business not found." });
    }
    res.json(updatedBusiness);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update the business." });
  }
};

// Delete a business by its ID
export const deleteBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const deletedBusiness = await SingleBusinessPermit.findByIdAndDelete(
      businessId
    );
    if (!deletedBusiness) {
      return res.status(404).json({ error: "Business not found." });
    }
    res.json({ message: "Business deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete the business." });
  }
};


export const changePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  const allowedStatuses = ["Paid", "Partially Paid", "Not Paid"];

  if (!allowedStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
    return;
  }

  try {
    const permit = await SingleBusinessPermit.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Business permit not found" });
      return;
    }

    permit.payment_status = paymentStatus;
    await permit.save();

    res
      .status(200)
      .json({ message: "Payment status updated successfully", permit });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
