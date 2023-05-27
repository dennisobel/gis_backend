import Transaction from "../models/Transaction.js";


// Gets paginated list of transactions. Result same as buildings result
export const getTransactions = async (req, res) => {
  console.log('REQ:',req.query)
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

  try {
    const transactions = await Transaction.paginate(searchFilter, options);
    res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { userId, cost, products } = req.body;
    const transaction = await Transaction.create({ userId, cost, products });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { userId, cost, products } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    transaction.userId = userId;
    transaction.cost = cost;
    transaction.products = products;
    await transaction.save();
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndRemove(req.params.id);
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsSummary = async (req, res) => {
  try {
    const today_date = new Date();
    const oneDayAgo = new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate() - 1);
    const oneWeekAgo = new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate() - 7);
    const oneYearAgo = new Date(today_date.getFullYear() - 1, today_date.getMonth(), today_date.getDate());

    res.status(200).json({
      summary: {
        transactions: {
          today: await getCount(Transaction, oneDayAgo, today_date), 
          this_week: await getCount(Transaction, oneWeekAgo, today_date),
          this_year: await getCount(Transaction, oneYearAgo, today_date)
        },
  
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCount = async (Model, startDate, endDate) => {
  try {
    const count = await Model.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    return count;
  } catch (error) {
    console.log("Error getting count")
    throw new Error(error);
  }
};