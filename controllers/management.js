import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Ward from "../models/Ward.js";

export const getAdmins = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };

      return sortFormatted;
    };
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    const admins = await User.find({
       role: "admin" 
    })
    // .select("-password")
    .sort(sortFormatted)
    .skip(page * pageSize)
    .limit(pageSize);
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const assignWardToOfficer = async (req, res) => {
  const { ward_id, officer_email } = req.body;
  try {
    const ward = await Ward.find({ id: ward_id });
    if (!ward) {
      res.status(404).json({ error: "Ward Not Found" });
    }

    const officer = await User.find({ email: officer_email })
    if (!officer){res.status(404).json({error: "Officer Not Found"})}

    if (officer.role !== "revenueOfficer") {
      return res.status(403).json({ error: "Assigned officer must have the role of 'revenueOfficer'" });
    }

    const allowedRoles = ["governor", "director", "management"];
    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Unauthorized. Only users with roles 'governor', 'director', or 'management' can perform this action." });
    }
    
    officer.block = ward._id;
    await officer.save();

    await ward.save();
  } catch (err) {}
};


export const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const userWithStats = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "affiliatestats",
          localField: "_id",
          foreignField: "userId",
          as: "affiliateStats",
        },
      },
      { $unwind: "$affiliateStats" },
    ]);

    const saleTransactions = await Promise.all(
      userWithStats[0].affiliateStats.affiliateSales.map((id) => {
        return Transaction.findById(id);
      })
    );
    const filteredSaleTransactions = saleTransactions.filter(
      (transaction) => transaction !== null
    );

    res
      .status(200)
      .json({ user: userWithStats[0], sales: filteredSaleTransactions });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};