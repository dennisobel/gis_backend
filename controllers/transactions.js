import SingleBusinessPermit from "../models/SingleBusinessPermit.js";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { format } from "date-fns";
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
      path: "store",
      select: "building",
      populate: {
        path: "building",
        select: "ward county",
      },
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
  const { ward } = req.query;
  const currentDate = new Date();
  let { days } = req.query;
  const { role } = req.user;

  if (!days) {
    console.log("USING DEFAULT DATE SETUP");
    days = 30;
  } else {
    days = parseInt(days);
  }
  const nDaysAgo = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);
  let filter = {};

  if (["revenue_officer", "revenueOfficer"].includes(role)) {
    console.log("FILTERING USING WARD TRANSACTIONS ONLY");
    filter = { "store.building.ward": req.user.ward };
  } else if (role === "admin" || role === "governor" || role === "director") {
    if (ward) {
      console.log("FILTERING USING COUNTY TRANSACTIONS ONLY");
      filter = { "store.building.ward": ward };
    } else {
      console.log("FILTERING USING COUNTY TRANSACTIONS ONLY");
      filter = { "store.building.county": req.user.county_id };
    }
  } else {
    filter = { msisdn: req.user.msisdn };
  }

  filter.createdAt = { $gte: nDaysAgo, $lte: currentDate };

  console.log("filter --> ", filter);

  const dateRange = [];
  for (let i = 1; i <= days; i++) {
    const date = new Date(nDaysAgo);
    date.setDate(date.getDate() + i);
    const dateString = format(date, "yyyy-MM-dd");

    dateRange.push({
      date: dateString,
      transactions_sum: 0,
      transactions_count: 0,
    });
  }
  const trxs = await Transaction.aggregate([
    {
      $lookup: {
        from: "singlebusinesspermits",
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
        from: "buildings",
        localField: "store.building",
        foreignField: "_id",
        as: "store.building",
      },
    },
    {
      $unwind: "$store.building",
    },

    // Match transactions + within the last n days
    {
      $match: filter,
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
  ]).exec();
  if (trxs.length == 0) {
    return res.status(200).json(dateRange);
  }

  console.log("got", trxs.length, "transactions");

  for (const obj of trxs) {
    const index = dateRange.findIndex((item) => item.date === obj._id);
    if (index !== -1) {
      const { transactions_sum, transactions_count } = obj;
      dateRange[index].transactions_sum = transactions_sum;
      dateRange[index].transactions_count = transactions_count;
    }
  }

  return res.status(200).json(dateRange);
};

export const getMonthlyTransactions = async (req, res) => {
  const { ward } = req.query;
  const { role } = req.user;

  try {
    let filter = {};
    let target = 0;
    if (["revenue_officer", "revenueOfficer"].includes(role)) {
      filter = { "store.building.ward": req.user.ward };
      // target = await getWardTarget(req.user.ward);
    } else if (role === "admin" || role === "governor" || role === "director") {
      if (ward) {
        console.log("FILTERING USING COUNTY TRANSACTIONS ONLY");
        filter = { "store.building.ward": ward };
      } else {
        console.log("FILTERING USING COUNTY TRANSACTIONS ONLY");
        filter = { "store.building.county": req.user.county_id };
      }
    } else {
      filter = { store: req.user.msisdn };
    }

    let { months } = req.query;
    if (months) {
      months = parseInt(months);
    } else {
      months = 12;
    }
    const currentDate = new Date();
    const nMonthsAgo = new Date();
    nMonthsAgo.setMonth(currentDate.getMonth() - months);

    const dateRange = [];
    for (let i = 1; i <= months; i++) {
      const date = new Date(nMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const dateString = format(date, "yyyy-MM");

      dateRange.push({
        date: dateString,
        transactions_sum: 0,
        balance: 0,
      });
    }

    filter.createdAt = { $gte: nMonthsAgo };

    console.log("filter: ", filter);
    console.log("target: ", target);

    const trxs = await Transaction.aggregate([
      {
        $lookup: {
          from: "singlebusinesspermits",
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
          from: "buildings",
          localField: "store.building",
          foreignField: "_id",
          as: "store.building",
        },
      },
      {
        $unwind: "$store.building",
      },

      // Match transactions + within the last n days
      {
        $match: filter,
      },
      // Group by date and calculate sum and count
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          transactions_sum: { $sum: { $toDouble: "$cost" } },
          transactions_count: { $sum: 1 },
        },
      },
    ]).exec();

    console.log("got", trxs.length, "transactions");

    for (const obj of trxs) {
      const index = dateRange.findIndex((item) => item.date === obj._id);
      if (index !== -1) {
        const { transactions_sum } = obj;
        dateRange[index].transactions_sum = transactions_sum;
        // dateRange[index].balance = target > 0 ? target - transactions_sum : 0;
      }
    }

    return res.status(200).json(dateRange);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An Error Occured When Processing Your Request" });
  }
};

export const verifyTransaction = async (req, res) => {
  const { store, receipt_no } = req.body;

  const transaction = await Transaction.findOne({ store, receipt_no });
  if (!transaction) {
    return res.status(400).json({ error: "Transaction does not exist" });
  }
  return res.status(200).json({ message: "Transaction verified successfully" });
};

export const getMonthlyTransactionsByStore = async (req, res) => {
  const { store_id } = req.params;

  try {
    let filter = {};
    if (store_id) {
      filter = { store: store_id };
    }

    let { months } = req.query;
    if (months) {
      months = parseInt(months);
    } else {
      months = 4;
    }
    const currentDate = new Date();
    const nMonthsAgo = new Date();
    nMonthsAgo.setMonth(currentDate.getMonth() - months);

    const dateRange = [];
    for (let i = 1; i <= months; i++) {
      const date = new Date(nMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const dateString = format(date, "yyyy-MM");

      dateRange.push({
        date: dateString,
        transactions_sum: 0,
        balance: 0,
      });
    }

    let target = 0;
    filter.createdAt = { $gte: nMonthsAgo };
    if (store_id) {
      target = await SingleBusinessPermit.find({ _id: store_id }).populate(
        "category",
        "price"
      );
      if (target) {
        target = target[0].category.price;
      } else {
        console.error("No Target Found For Store", store_id);
      }
    }

    console.log("filter: ", filter);
    console.log("target: ", target);

    const trxs = await Transaction.aggregate([
      {
        $match: {
          store: mongoose.Types.ObjectId(store_id),
          createdAt: {
            $gte: nMonthsAgo,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          transactions_sum: { $sum: { $toDouble: "$cost" } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]).exec();

    console.log("got", trxs.length, "transactions");

    for (const obj of trxs) {
      const index = dateRange.findIndex((item) => item.date === obj._id);
      if (index !== -1) {
        const { transactions_sum } = obj;
        dateRange[index].transactions_sum = transactions_sum;
        dateRange[index].balance = target > 0 ? target - transactions_sum : 0;
      }
    }

    return res.status(200).json(dateRange);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An Error Occured When Processing Your Request" });
  }
};

export const getWardTarget = async (ward) => {
  const results = await SingleBusinessPermit.aggregate([
    {
      $lookup: {
        from: "buildings",
        localField: "building",
        foreignField: "_id",
        as: "building",
      },
    },
    {
      $unwind: '$building'
    },
    {
      $match: {
        "building.ward": ward,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        categoryPrice: { $first: "$categoryInfo.price" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]).exec();

  let cumulativeCount = 0;
  const targets = results.map((result) => {
    cumulativeCount += result.count;
    return {
      month: result._id,
      target: cumulativeCount * result.categoryPrice,
    };
  });

  // Handle targets
  console.log(targets);
  return targets;
};
