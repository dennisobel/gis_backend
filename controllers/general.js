import User from "../models/User.js";
import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";
import SingleBusinessPermit from "../models/SingleBusinessPermit.js";
import axios from "axios";
import StkWaiting from "../models/StkWaiting.js";

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
    const overallStat = await OverallStat.find();

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
    console.log("ERROR GENERATING STATS", error);
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
        businesses: {
          today: await getCount(SingleBusinessPermit, oneDayAgo, today_date),
          this_week: await getCount(
            SingleBusinessPermit,
            oneWeekAgo,
            today_date
          ),
          this_year: await getCount(
            SingleBusinessPermit,
            oneYearAgo,
            today_date
          ),
        },
        users: {
          today: await getCount(User, oneDayAgo, today_date),
          this_week: await getCount(User, oneWeekAgo, today_date),
          this_year: await getCount(User, oneYearAgo, today_date),
        },
        collections: {
          today: await totalCollected(oneDayAgo, today_date),
          this_week: await totalCollected(oneWeekAgo, today_date),
          this_year: await totalCollected(oneYearAgo, today_date),
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

export const sendStkPush = async (req, res) => {
  const { amount, msisdn, store_id } = req.body;

  let errors = [];
  if (!amount) errors.push("'amount' is a required field");
  if (!msisdn) errors.push("'msisdn' is a required field");
  if (!store_id) errors.push("'store_id' is a required field");
  const store = await SingleBusinessPermit.find({ _id: store_id })
    .exec()
    .catch((error) => {
      console.error(error);
    });

  if (!store)
    errors.push(
      "Not enough permissions to access the store, or no store found"
    );
  if (errors.length > 0) return res.status(400).json({ error: errors });

  var data = JSON.stringify({
    amount: amount,
    msisdn: msisdn,
  });

  var config = {
    method: "post",
    url: "https://tinypesa.com/api/v1/express/initialize",
    headers: {
      Apikey: "7JkoBZDIUTa",
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log("------------success response------------------");
      console.log(JSON.stringify(response.data));

      const newStkWaiting = new StkWaiting({
        msisdn: msisdn,
        amount: amount,
        store: store[0]._id,
        fulfilled: false,
      });

      newStkWaiting
        .save()
        .then((result) => {
          console.log("saved stk waiting request", result);
        })
        .catch((error) => {
          console.log("error saving request", error);
        });
      res.status(200).json(response.data);
    })
    .catch(function (error) {
      console.log("------------error response------------------");
      console.log(error.response.data);
      res.status(400).json(error.response.data);
    });
};

export const handleStkPushCallback = async (req, res) => {
  const data = req.body;

  var message = "";
  if (
    data.Body &&
    data.Body.stkCallback &&
    data.Body.stkCallback.CallbackMetadata
  ) {
    // this is a successful payment

    // get stk_waiting data for this payment

    const result = { request_dump: JSON.stringify(data) };

    for (const item of data.Body.stkCallback.CallbackMetadata.Item) {
      const { Name, Value } = item;

      switch (Name) {
        case "Amount":
          result.amount = Value;
          break;
        case "MpesaReceiptNumber":
          result.trx_id = Value;
          break;
        case "PhoneNumber":
          result.msisdn = Value;
          break;
        case "TransactionDate":
          result.trx_date = new Date(Value);
          break;
        default:
          break;
      }
    }

    const stk_waiting = await StkWaiting.findOne({
      msisdn: result.msisdn,
      fulfilled: false,
    })
      .sort({ createdAt: -1 })
      .exec();

    if (!stk_waiting) {
      message =
        "UNABLE TO FIND STK_WAITING RECORD FOR THIS TRANSACTION. IGNORING...";
      console.log(message);
    } else {
      const new_transaction = new Transaction({
        msisdn: result.msisdn,
        cost: result.amount,
        receipt_no: result.trx_id,
        transaction_date: result.trx_date,
        store: stk_waiting.store,
        request_dump: result.request_dump,
      });
      new_transaction
        .save()
        .then((result) => {
          console.log("Saved new transaction ->", result);
          message = "success";
        })
        .catch((error) => {
          console.log("Error saving transaction -> ", error);
          message = "Error Saving Transaction";
        });
    }
  } else {
    console.log(
      "---------------------------------------------- UNSUCCESSFUL STK PUSH -------------------------------------------"
    );
    console.log(data.Body.stkCallback.ResultDesc);
    message = data.Body.stkCallback.ResultDesc;
  }

  console.log(data);
  return res.status(200).json({ message: message });
};
