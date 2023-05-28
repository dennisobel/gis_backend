import mongoose from "mongoose";
import Ward from "../models/Ward.js";
import Transaction from "../models/Transaction.js";

// Create a new ward
export const createWard = async (req, res) => {
  try {
    const wardData = req.body;
    const ward = new Ward(wardData);
    const newWard = await ward.save();
    return res.status(201).json(newWard);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Read all wards
export const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find().populate("subCounty");
    return res.status(200).json(wards);
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
    return res.status(200).json(ward);
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
    return res.status(200).json(updatedWard);
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
    return res.status(200).json({ message: "Ward deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


// Gets Transactions Summary For Wards. 

// sample response: 
// {
//   "summary": [
//     {
//       "ward": "Ward 1",
//       "todayTotal": 1000,
//       "thisMonthTotal": 5000,
//       "thisYearTotal": 20000
//     },
//     {
//       "ward": "Ward 2",
//       "todayTotal": 1500,
//       "thisMonthTotal": 6000,
//       "thisYearTotal": 25000
//     }
//   ],
//   "total": 2
// }


export const getTransactionSummaryForWards = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Months are zero-based (0 - 11)

    const pipeline = [
      // Aggregation stages for calculating totals
      {
        $group: {
          _id: "$store",
          todayTotal: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    {
                      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    { $dateToString: { format: "%Y-%m-%d", date: today } },
                  ],
                },
                { $toDouble: "$cost" },
                0,
              ],
            },
          },
          thisMonthTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $year: "$createdAt" }, currentYear] },
                {
                  $cond: [
                    { $eq: [{ $month: "$createdAt" }, currentMonth] },
                    { $toDouble: "$cost" },
                    0,
                  ],
                },
                0,
              ],
            },
          },
          thisYearTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $year: "$createdAt" }, currentYear] },
                { $toDouble: "$cost" },
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "buildings",
          localField: "_id",
          foreignField: "_id",
          as: "building",
        },
      },
      {
        $unwind: "$building",
      },
      {
        $project: {
          _id: 0,
          ward: "$building.ward",
          todayTotal: 1,
          thisMonthTotal: 1,
          thisYearTotal: 1,
        },
      },
      // Pagination stages
      { $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) },
      { $limit: parseInt(limit, 10) },
    ];

    const countPipeline = [
      // Aggregation stages for counting total documents
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const [summary, countResult] = await Promise.all([
      Transaction.aggregate(pipeline).exec(),
      Transaction.aggregate(countPipeline).exec(),
    ]);

    const total = countResult[0] ? countResult[0].count : 0;

    return res.status(200).json({ summary, total });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get summary as above, but for a specific ward. Will be used to get summary for officer since officers have wards assigned to them
// sample response: 

// {
//   "summary": [
//     {
//       "_id": "Ward ID",
//       "todayTotal": 1000,
//       "thisMonthTotal": 5000,
//       "thisYearTotal": 20000
//     }
//   ]
// }

export const getTransactionSummaryByWard = async (req, res) => {
  const { ward } = req.query;

  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Months are zero-based (0 - 11)

    const pipeline = [
      // Aggregation stages for calculating totals
      {
        $match: { ward: ward } // Filter transactions by the specified ward
      },
      {
        $group: {
          _id: '$store',
          todayTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, { $dateToString: { format: '%Y-%m-%d', date: today } }] },
                { $toDouble: '$cost' },
                0
              ]
            }
          },
          thisMonthTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $year: '$createdAt' }, currentYear] },
                {
                  $cond: [
                    { $eq: [{ $month: '$createdAt' }, currentMonth] },
                    { $toDouble: '$cost' },
                    0
                  ]
                },
                0
              ]
            }
          },
          thisYearTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $year: '$createdAt' }, currentYear] },
                { $toDouble: '$cost' },
                0
              ]
            }
          }
        }
      }
    ];

    const summary = await Transaction.aggregate(pipeline).exec();

    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
