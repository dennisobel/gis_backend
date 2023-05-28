import User from "../models/User.js";
import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";
import SingleBusinessPermit from "../models/SingleBusinessPermit.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // hardcoded values
    const currentMonth = "November";
    const currentYear = 2021;
    const currentDay = "2021-11-15";

    /* Recent Transactions */
    const transactions = await Transaction.find()
      .limit(50)
      .sort({ createdOn: -1 });

    /* Overall Stats */
    const overallStat = await OverallStat.find({ year: currentYear });

    const {
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
    } = overallStat[0];

    const thisMonthStats = overallStat[0].monthlyData.find(({ month }) => {
      return month === currentMonth;
    });

    const todayStats = overallStat[0].dailyData.find(({ date }) => {
      return date === currentDay;
    });

    return res.status(200).json({
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
      transactions,
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};


// Getting summaries for the dashboard
// GET http://localhost:5001/general/summaries
// sample response: 
// {
//   "summary": {
//     "transactions": {
//       "today": 0,
//       "this_week": 0,
//       "this_year": 0
//     },
//     "businesses": {
//       "today": 356,
//       "this_week": 356,
//       "this_year": 356
//     },
//     "users": {
//       "today": 28602,
//       "this_week": 28602,
//       "this_year": 28602
//     },
//     "collections": {
//       "today": "0.00",
//       "this_week": "0.00",
//       "this_year": "0.00"
//     }
//   }
// }

export const getSummaries = async (req, res) => {
  try {
    const today_date = new Date();
    const oneDayAgo = new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate() - 1);
    const oneWeekAgo = new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate() - 7);
    const oneYearAgo = new Date(today_date.getFullYear() - 1, today_date.getMonth(), today_date.getDate());

    return res.status(200).json({
      summary: {
        transactions: {
          today: await getCount(Transaction, oneDayAgo, today_date), 
          this_week: await getCount(Transaction, oneWeekAgo, today_date),
          this_year: await getCount(Transaction, oneYearAgo, today_date)
        },
        businesses: {
          today: await getCount(SingleBusinessPermit, oneDayAgo, today_date), 
          this_week: await getCount(SingleBusinessPermit, oneWeekAgo, today_date),
          this_year: await getCount(SingleBusinessPermit, oneYearAgo, today_date)
        },
        users: {
          today: await getCount(User, oneDayAgo, today_date), 
          this_week: await getCount(User, oneWeekAgo, today_date),
          this_year: await getCount(User, oneYearAgo, today_date)
        },
        collections: {
          today: await totalCollected(oneDayAgo, today_date), 
          this_week: await totalCollected(oneWeekAgo, today_date),
          this_year: await totalCollected(oneYearAgo, today_date)
        }
      }
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
    console.log("Error getting count")
    throw new Error(error);
  }
};

const totalCollected = async (startDate, endDate) => {
  try {
    const transactions = await Transaction.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const totalAmount = transactions.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.cost);
    }, 0);
    return totalAmount.toFixed(2);
  } catch (error) {
    throw new Error(error);
  }
};