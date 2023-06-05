import Transaction from "../models/Transaction.js";

// Gets paginated list of transactions. Result same as buildings result
export const getTransactions = async (req, res) => {
  // try {
  //   const transactions = await Transaction.find();
  //   res.status(200).json(transactions);
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // }
  const {
    page = 1,
    limit = 10,
    // sortField = "createdAt",
    // sortOrder = "desc",
  } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    populate: {
      path: "products",
      model: "Product",
    },
  };

  const searchFilter = {};

  // if (building_number) {
  //   searchFilter.building_number = { $regex: building_number };
  // }
  // if (ward) {
  //   searchFilter.ward = { $regex: ward, $options: "i" };
  // }

  try {
    const transactions = await Transaction.paginate(searchFilter, options);
    return res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
      return;
    }
    return res.status(200).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { userId, cost, products } = req.body;
    const transaction = await Transaction.create({ userId, cost, products });
    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { userId, cost, products } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
      return;
    }
    transaction.userId = userId;
    transaction.cost = cost;
    transaction.products = products;
    await transaction.save();
    return res.status(200).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndRemove(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
      return;
    }
    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTransactionsSummary = async (req, res) => {
  try {
    const today_date = new Date();
    const oneDayAgo = new Date(
      today_date.getFullYear(),
      today_date.getMonth(),
      today_date.getDate() - 1
    );
    const oneWeekAgo = new Date(
      today_date.getFullYear(),
      today_date.getMonth(),
      today_date.getDate() - 7
    );
    const oneYearAgo = new Date(
      today_date.getFullYear() - 1,
      today_date.getMonth(),
      today_date.getDate()
    );

    return res.status(200).json({
      summary: {
        transactions: {
          today: await getCount(Transaction, oneDayAgo, today_date),
          this_week: await getCount(Transaction, oneWeekAgo, today_date),
          this_year: await getCount(Transaction, oneYearAgo, today_date),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCount = async (Model, startDate, endDate) => {
  try {
    const count = await Model.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    return count;
  } catch (error) {
    console.log("Error getting count");
    throw new Error(error);
  }
};

export const getDailyTransactions = async (req, res) => {
  console.log("Getting Daily Transactions Stats");
  const currentDate = new Date();
  let { days } = req.query;
  if (!days) {
    console.log("USING DEFAULT DATE SETUP");
    days = 30;
  } else {
    days = parseInt(days);
  }
  const thirtyDaysAgo = new Date(
    currentDate.getTime() - days * 24 * 60 * 60 * 1000
  );

  Transaction.aggregate([
    // Match transactions within the last n days
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo, $lte: currentDate },
      },
    },
    // Group by date and calculate sum and count
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        transactions_sum: { $sum: { $toDouble: "$cost" } },
        transactions_count: { $sum: 1 },
      },
    },
    // Generate the date range for the last n days
    {
      $project: {
        date: { $dateFromString: { dateString: "$_id" } },
        transactions_sum: 1,
        transactions_count: 1,
      },
    },
    // Generate the complete date range for the last n days, including missing dates
    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
      },
    },
    {
      $project: {
        dates: {
          $map: {
            input: { $range: [0, days] },
            as: "i",
            in: {
              $subtract: [
                currentDate,
                { $multiply: ["$$i", 24 * 60 * 60 * 1000] },
              ],
            },
          },
        },
      },
    },
    {
      $unwind: "$dates",
    },
    // Lookup transactions for each date
    {
      $lookup: {
        from: "transactions",
        let: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$dates" } },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$createdAt",
                        },
                      },
                      "$$date",
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "matchedTransactions",
      },
    },
    // Calculate sum and count for each date
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$dates" } },
        transactions_sum: {
          $cond: {
            if: { $eq: [{ $size: "$matchedTransactions" }, 0] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: "$matchedTransactions",
                  as: "transaction",
                  in: { $toDouble: "$$transaction.cost" },
                },
              },
            },
          },
        },
        transactions_count: {
          $cond: {
            if: { $eq: [{ $size: "$matchedTransactions" }, 0] },
            then: 0,
            else: { $size: "$matchedTransactions" },
          },
        },
      },
    },
    // Sort by date in ascending order
    {
      $sort: {
        date: 1,
      },
    },
    // Project the final result
    {
      $project: {
        _id: 0,
        date: 1,
        transactions_sum: 1,
        transactions_count: 1,
      },
    },
  ]).exec((err, result) => {
    if (err) {
      res.status(500).json(err);
      console.error(err);
      return;
    }

    res.status(200).json(result);
  });
};

export const getMonthlyTransactions = async (req, res) => {
  let { months } = req.query
  if (months) {
    months = parseInt(months)
  } else {
    months = 12
  }
  const currentDate = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(currentDate.getMonth() - 12);

  Transaction.aggregate([
    // Match transactions within the last n months
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo, $lte: currentDate },
      },
    },
    // Group by year and month and calculate sum and count
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        transactions_sum: { $sum: { $toDouble: "$cost" } },
        transactions_count: { $sum: 1 },
      },
    },
    // Generate the complete month range for the last 6 months, including missing months
    {
      $group: {
        _id: null,
        months: { $push: "$_id" },
      },
    },
    {
      $project: {
        months: {
          $map: {
            input: { $range: [0, months] },
            as: "i",
            in: {
              $dateToString: {
                format: "%Y-%m",
                date: {
                  $subtract: [
                    currentDate,
                    { $multiply: ["$$i", 30 * 24 * 60 * 60 * 1000] },
                  ],
                },
              },
            },
          },
        },
      },
    },
    {
      $unwind: "$months",
    },
    // Lookup transactions for each month
    {
      $lookup: {
        from: "transactions",
        let: { month: "$months" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" },
                      },
                      "$$month",
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "matchedTransactions",
      },
    },
    // Calculate sum and count for each month
    {
      $project: {
        month: "$months",
        transactions_sum: {
          $cond: {
            if: { $eq: [{ $size: "$matchedTransactions" }, 0] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: "$matchedTransactions",
                  as: "transaction",
                  in: { $toDouble: "$$transaction.cost" },
                },
              },
            },
          },
        },
        transactions_count: {
          $cond: {
            if: { $eq: [{ $size: "$matchedTransactions" }, 0] },
            then: 0,
            else: { $size: "$matchedTransactions" },
          },
        },
      },
    },
    // Sort by year and month in ascending order
    {
      $sort: {
        month: 1,
      },
    },
    // Project the final result
    {
      $project: {
        _id: 0,
        month: 1,
        transactions_sum: 1,
        transactions_count: 1,
      },
    },
  ]).exec((err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json(err);
      return;
    }

    res.status(200).json(result);
  });
};
