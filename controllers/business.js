import SingleBusinessPermit from "../models/SingleBusinessPermit.js";
import Building from "../models/Building.js";

// Create a new business registration
export const createBusiness = async (req, res) => {
  try {
    const businessData = req.body;
    const newBusiness = new SingleBusinessPermit(businessData);
    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create a new business." });
  }
};

// Retrieve all businesses
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await SingleBusinessPermit.find();
    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve businesses." });
  }
};

// Retrieve all businesses in a building
export const getAllBuildingBusinesses = async (req, res) => {
  const id = req.params.building;
  try {
    const businesses = await SingleBusinessPermit.find({
      building: id,
    });
    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve businesses." });
  }
};

/**Get business by county */
export const getAllCountyBusinesses = async (req, res) => {
  console.log("in get county business")
  const county = req.params.county;
  const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;
  // formatted sort should look like { userId: -1 }
  const generateSort = () => {
    const sortParsed = JSON.parse(sort);
    const sortFormatted = {
      [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
    };

    return sortFormatted;
  };
  const sortFormatted = Boolean(sort) ? generateSort() : {};

  try {
    const businesses = await SingleBusinessPermit.find({
      $or: [
        { business_name: { $regex: new RegExp(search, "i") } },
        { building_name: { $regex: new RegExp(search, "i") } },
        { payment_status: { $regex: new RegExp(search, "i") } },
        { street: { $regex: new RegExp(search, "i") } },
        { plot_no: { $regex: new RegExp(search, "i") } },
        { sub_county: { $regex: new RegExp(search, "i") } },
        { ward: { $regex: new RegExp(search, "i") } },
      ],
    })
      .populate({
        path: "buildings",
        match: { county: county },
      })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await SingleBusinessPermit.countDocuments({
      name: { $regex: search, $options: "i" },
    });

    const countyBusinesses = businesses.filter((business) => {
      return business.building !== null; // Filter out businesses without a building reference
    });

    res.status(200).json({
      countyBusinesses,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to retrieve businesses. ${error}` });
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
    res.status(500).json({ error: "Failed to retrieve the business." });
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
    res.status(500).json({ error: "Failed to update the business." });
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
    res.status(500).json({ error: "Failed to delete the business." });
  }
};


export const changePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  const allowedStatuses = ["Paid", "Partially Paid", "Not Paid"];

  if (!allowedStatuses.includes(paymentStatus)) {
    res.status(400).json({ message: "Invalid payment status" });
    return;
  }

  try {
    const permit = await SingleBusinessPermit.findById(id);

    if (!permit) {
      res.status(404).json({ message: "Business permit not found" });
      return;
    }

    permit.payment_status = paymentStatus;
    await permit.save();

    res
      .status(200)
      .json({ message: "Payment status updated successfully", permit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
