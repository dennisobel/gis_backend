import Building from "../models/Building.js";
import Event from "../models/Event.js";
import SingleBusinessPermit from "../models/SingleBusinessPermit.js";
import Target from "../models/Target.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const getTotalCollectedInWard = async (ward, startDate, endDate) => {
  try {
    const result = await Transaction.aggregate([
      // Lookup SingleBusinessPermit using store field
      {
        $lookup: {
          from: "singlebusinesspermits",
          localField: "store",
          foreignField: "_id",
          as: "store",
        },
      },
      // Unwind the store array to get a single document per transaction
      { $unwind: "$store" },
      // Lookup Building using store.building field
      {
        $lookup: {
          from: "buildings",
          localField: "store.building",
          foreignField: "_id",
          as: "building",
        },
      },
      // Unwind the building array to get a single document per transaction
      { $unwind: "$building" },
      // Match transactions within the specified date range
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          "building.ward": ward,
        },
      },
      // Group and calculate the sum of cost for each ward
      {
        $group: {
          _id: "$building.ward",
          totalCost: { $sum: { $toDouble: "$cost" } },
        },
      },
    ]);

    if (result.length > 0) {
      return result[0].totalCost;
    }
    return 0; // Return 0 if no transactions found for the ward
  } catch (error) {
    console.error("Error retrieving transaction sum:", error);
    throw error;
  }
};

export const setWardTarget = async (targetWard) => {
  const results = await SingleBusinessPermit.aggregate([
    {
      $lookup: {
        from: "buildings",
        localField: "building",
        foreignField: "_id",
        as: "buildingData",
      },
    },
    {
      $unwind: "$buildingData",
    },
    {
      $match: {
        "buildingData.ward": targetWard,
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    {
      $unwind: "$categoryData",
    },
    {
      $group: {
        _id: null,
        totalPrice: { $sum: "$categoryData.price" },
      },
    },
  ]).exec();

  // getting officer

  const officer = User.findOne({ ward: targetWard });

  const target = results.length > 0 ? results[0].totalPrice : 0;

  const new_target = new Target({
    month: await formattedDate(),
    officer: officer._id,
    ward: targetWard,
    amount: target,
  });

  try {
    new_target
      .save()
      .then((res) => {
        console.log("SAVED TARGET FOR ", targetWard);
      })
      .catch((error) => {
        console.log("Unable to save new taregt", error);
      });
  } catch (error) {
    console.error(error);
    console.log("Error saving target for ward ", targetWard, "skipping....");
  }
};

export const formattedDate = async () => {
  var currentDate = new Date();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();

  if (month < 10) {
    month = "0" + month;
  }

  return month + "-" + year;
};

export const checkinOfficerToStore = async (req, res, next) => {
  console.log("CHECKING IN OFFICER TO BUILDING...");
  const { coordinates, user, store } = req;

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const checkins = await Event.findOne({
      dateCreated: { $gte: today },
      type: "store_checkin",
      user: user._id
    }).exec();

    if (!checkins) {
      const event = new Event({
        type: "store_checkin",
        coordinates: coordinates,
        store: store,
        user: user,
      });

      event
        .save()
        .catch((error) => {
          console.log("error checking in officer to store", error);
        })
        .then(() => {
          console.log(
            "OFFICER ",
            user.email,
            "CHECKED IN TO STORE ",
            store
          );
        });
    } else {
      console.log("looks like the officer has signed into this store today");
    }
  } catch (error) {
    console.error(error);
  }
};

export const getOfficerVisitsCount = async (officer) => {
  const today_date = new Date();
  const thisMonth = new Date(
    today_date.getFullYear(),
    today_date.getMonth(),
    1
  );

  const eventsCount = Event.countDocuments({
    type: "store_checkin",
    user: officer._id,
    dateCreated: {
      $gte: thisMonth
    },
  })

  return eventsCount
};


export const getBuildingPaymentStatusCountByWard = async (ward) => {
  const status = Building.aggregate([
    { $match: { ward } }, // Filter buildings by the specified ward
    {
      $group: {
        _id: null, // Group all documents together
        not_paid_total: { $sum: '$not_paid_count' }, // Sum the not_paid_count field
        paid_total: { $sum: '$paid_count' }, // Sum the paid_count field
        partially_paid_total: { $sum: '$partially_paid_count' } // Sum the partially_paid_count field
      }
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the result
        not_paid_total: 1,
        paid_total: 1,
        partially_paid_total: 1
      }
    }
  ])

  return status
}
