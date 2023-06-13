import SingleBusinessPermit from "../models/SingleBusinessPermit.js";
import Image from "../models/Image.js";
import Escalation from "../models/Escalation.js";
import fs from "fs";
import RootPath from "app-root-path";
import Transaction from "../models/Transaction.js";
import { isBuildingWithinNMeters } from "../middleware/check_location.js";
import { checkinOfficerToStore } from "../utils/helpers.js";
import County from "../models/County.js";
import Event from "../models/Event.js";

// Create a new business registration
export const createBusiness = async (req, res) => {
  try {
    const businessData = req.body;
    const newBusiness = new SingleBusinessPermit(businessData);
    const savedBusiness = await newBusiness.save();
    res.locals.store = savedBusiness;
    res.locals.event_type = "business_registration";
    return res.status(201).json(savedBusiness);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create a new business." });
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
  console.log("in get county business");
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
    // const businesses = await SingleBusinessPermit.find({
    //   $or: [
    //     { business_name: { $regex: new RegExp(search, "i") } },
    //     { building_name: { $regex: new RegExp(search, "i") } },
    //     { payment_status: { $regex: new RegExp(search, "i") } },
    //     { street: { $regex: new RegExp(search, "i") } },
    //     { plot_no: { $regex: new RegExp(search, "i") } },
    //     { sub_county: { $regex: new RegExp(search, "i") } },
    //     { ward: { $regex: new RegExp(search, "i") } },
    //   ],
    //   'building.county': county
    // })
    //   .populate({
    //     path: "building",
    //     // match: { county: county },
    //   })
    const businesses = await SingleBusinessPermit.aggregate([
      {
        $lookup: {
          from: "buildings", // Replace with the actual collection name for the Business model
          localField: "building",
          foreignField: "_id",
          as: "building",
        },
      },
      {
        $unwind: "$building",
      },
      {
        $match: {
          $or: [
            { business_name: { $regex: new RegExp(search, "i") } },
            { building_name: { $regex: new RegExp(search, "i") } },
            { payment_status: { $regex: new RegExp(search, "i") } },
            { street: { $regex: new RegExp(search, "i") } },
            { plot_no: { $regex: new RegExp(search, "i") } },
            { sub_county: { $regex: new RegExp(search, "i") } },
            { ward: { $regex: new RegExp(search, "i") } },
          ],
          "building.county": county,
        },
      },
    ])
      // .sort(sortFormatted)
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

export const getWardBusinesses = async (req, res) => {
  try {
    const { ward } = req.params;
    console.log("WARD:", ward);
    const businesses = await SingleBusinessPermit.find({ ward });
    res.json(businesses);
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
    res.locals.store = business;
    res.locals.json(business);
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
    res.locals.store = updateBusiness;
    res.locals.event_type = "business_info_update";
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
    }
    res.locals.store = permit;
    res.locals.event_type = "business_info_update";
    permit.payment_status = paymentStatus;
    await permit.save();

    res
      .status(200)
      .json({ message: "Payment status updated successfully", permit });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEscalations = async (req, res) => {
  const { county_id } = req.user;
  const county = await County.findOne({ code: county_id }).exec();
  if (!county) {
    return res.status(400).json({ error: "No county found" });
  }
  try {
    Escalation.aggregate([
      {
        $lookup: {
          from: "singlebusinesspermits", // Replace with the actual collection name for the Business model
          localField: "store",
          foreignField: "_id",
          as: "store",
        },
      },
      {
        $unwind: "$store",
      },
      {
        $lookup: {
          from: "buildings", // Replace with the actual collection name for the Building model
          localField: "store.building",
          foreignField: "_id",
          as: "store.building",
        },
      },
      {
        $unwind: "$store.building",
      },
      {
        $match: {
          "store.building.county": county.name, // Replace with the desired county
        },
      },
      {
        $project: {
          "store._id": 1,
          "store.store_no": 1,
          "store.building._id": 1,
          "store.building.location": 1,
          "store.building.building_number": 1,
          "store.building.county": 1,
          "store.building.ward": 1,
          reason: 1,
          attended_to: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }
      return res.status(200).json(result);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json([]);
  }
};

export const escalateBusiness = async (req, res) => {
  const { store_id, reason, escalate } = req.body;

  const store = await SingleBusinessPermit.findById(store_id);
  if (!store) {
    return res.status(404).json({
      message: "You have no permission to view this store or store not found",
    });
  }
  res.locals.store = store;

  store.escalated = escalate;
  store.save().catch((error) => {
    console.log("Error saving escalation", error);
  });

  if (escalate) {
    const escalation = new Escalation({
      store: store._id,
      escalated_by: req.user,
      reason: reason,
      attended_to: false,
    });
    escalation
      .save()
      .then((result) => {
        console.log("Created Escalation ");
        res.locals.event_type = "business_escalation";

        return res
          .status(200)
          .json({ message: "Business Escalation successful" });
      })
      .catch((error) => {
        console.log("Error", error);
      });
  } else {
    try {
      const esc = await Escalation.findOne({ store: store._id })
        .sort({ createdAt: -1 })
        .exec();
      esc.attended_to = true;
      esc.save().catch(() => {
        console.log("Unable to update escalation status");
      });
      res.locals.event_type = "business_deescalation";
      return res
        .status(200)
        .json({ message: "Business Escalation Resolved successfully" });
    } catch (error) {
      console.error(error);
    }
  }
  res.status(200).json({ message: "Escalation status unknown" });
};

export const uploadBusinessImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const { category, description } = req.body;

  const image = new Image({ path: req.file.path, description: description });
  await image.save().catch((error) => {
    console.log(error);
    return res.status(500).send("Unable to save image");
  });

  if (category === "building") {
    const { store_id } = req.body;
    const store = await SingleBusinessPermit.findById(store_id);
    if (!store) {
      return res
        .status(400)
        .json({ error: "Store not found, or no permission to access store" });
    }
    req.store = store;
    req.event_type = "business_info_update";

    store.image = image._id;
    await store
      .save()
      .catch((error) => {
        console.log(error);
        return res.status(400).json({ error: "Unable to save image to store" });
      })
      .then((result) => {
        console.log("Updated store with the image", result);
        return res
          .status(200)
          .json({ message: "Store image saved successfully" });
      });
  } else if (category === "payment") {
    const { transaction_id } = req.body;
    const transaction = await Transaction.findById(transaction_id);
    if (!transaction) {
      return res.status(400).json({
        error: "Transaction not found, or no permission to access transaction",
      });
    }
    transaction.receipts.push(image._id);
    transaction.verified = true;
    await transaction
      .save()
      .catch((error) => {
        console.log(error);
        return res
          .status(400)
          .json({ error: "Unable to save receipt to transaction" });
      })
      .then((result) => {
        console.log("Added receipt to the transaction", result);
        return res
          .status(200)
          .json({ message: "Transaction image saved successfully" });
      });
  } else {
    return res.status(400).json({ error: "'category' field not found. " });
  }
};

export const getImage = async (req, res) => {
  const { id } = req.params; // Extract the image ID from the request parameters

  try {
    // Find the image by ID
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).send("Image not found.");
    }

    // Read the image file
    const imagePath = `${RootPath}/${image.path}`;
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error(err);

        return res.status(500).send("Failed to read image file.");
      }

      // Set the appropriate content type header
      res.setHeader("Content-Type", "image/jpeg");

      // Send the image data
      res.send(data);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve image.");
  }
};

export const verifyBusiness = async (req, res) => {
  const { store_id, verified } = req.body;

  if (!store_id)
    return res.status(400).json({ error: "'store_id' field is mandatory" });
  if (verified === undefined)
    return res.status(400).json({ error: "'verified' field is mandatory" });

  const store = await SingleBusinessPermit.findById(store_id).populate(
    "building"
  );
  if (!store) {
    return res
      .status(400)
      .json({ error: "Store not found, or no permission to access store" });
  }
  const isNear = await isBuildingWithinNMeters(
    store.building.location,
    req.coordinates
  );
  if (!isNear) {
    return res
      .status(400)
      .json({ error: "You can only edit a store while you are in it. " });
  }

  res.locals.store = store;
  res.locals.event_type = "business_verification";
  await checkinOfficerToStore(req, res, undefined);

  store.verified = verified;
  store.verified_by = req.user._id;
  await store
    .save()
    .then((result) => {
      console.log(result);
      return res.status(200).json({
        message: `Store marked as ${verified ? "verified" : "unverified"} by ${
          req.user.name
        }`,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Error when verifying business" });
    });
};


export const activity_log = async (req, res) => {
  const { store_id } = req.params;

  console.log("- getting activities for ", store_id);
  const store = await SingleBusinessPermit.findById(store_id)
  if (!store){
    return res.status(400).json({error: 'Store not found or you have no permission to view it'})

  }
  const { type } = req.query;
  let typeQuery = [];
  if (!type) {
    typeQuery = [
      "business_registration",
      "payment_verification",
      "business_verification",
      "store_checkin",
      "business_escalation",
      "business_deescalation",
      "business_info_update",
    ];
  } else {
    typeQuery = [type];
  }

  const logs = await Event.find(
    { store, type: { $in: typeQuery } },
    "_id type coordinates"
  )
    .populate("user", "name")
    .populate("store", "store_no")
    .exec();

  return res.status(200).json(logs);
};
