import Building from "../models/Building.js";
import SingleBusinessPermit from "../models/SingleBusinessPermit.js";

// Get buildings
// http://localhost:5001/buildings?limit=3&page=1
// http://localhost:5001/buildings
// http://localhost:5001/buildings?ward=<ward name>
// sample response:

// {
//   "docs": [
//     {
//       "_id": "6470c8be9c80eefb7eb12186",
//       "building_number": "A1/1",
//       "floors": 1,
//       "type_of_structure": "Permanent",
//       "street": "Hospital road",
//       "description": "The building is white in color",
//       "county": "Makueni",
//       "sub_county": "Makueni",
//       "ward": "Wote",
//       "longitude": "37.6267237",
//       "latitude": "-1.7824086",
//       "singleBusinessPermits": [
//         {
//           "_id": "6470da9f0be76dbb5a031afd",
//           "application_type": "New",
//           "registered": "false",
//           "business_name": "Mayert, Heller and Kutch",
//           "branch_name": "main",
//           "floor_no": "1st floor ",
//           "store_no": "A1/1/2",
//           "business_category": "Empty store",
//           "business_sub_category": "",
//           "business_description": "The store is closed",
//           "no_of_employees": 132,
//           "additional_activity": "",
//           "premise_size": "",
//           "business_email": "Jordon85@hotmail.com",
//           "business_phone": "(725) 385-4069 x9667",
//           "postal_address": "22743 Kertzmann Bypass",
//           "postal_code": "92790-8358",
//           "payment_status": "Paid",
//           "is_building_open": "open",
//           "user": "6470da9f0be76dbb5a031afc",
//           "building": "6470c8be9c80eefb7eb12186",
//           "createdAt": "2023-05-26T16:13:19.786Z",
//           "updatedAt": "2023-05-26T16:13:19.786Z",
//           "__v": 0
//         }
//         ...
//       ],
//       "createdAt": "2023-05-26T14:57:02.971Z",
//       "updatedAt": "2023-05-26T16:13:19.978Z",
//       "__v": 16
//     },
//     ...
//   ],
//   "totalDocs": 21410,
//   "limit": 3,
//   "totalPages": 7137,
//   "page": 1,
//   "pagingCounter": 1,
//   "hasPrevPage": false,
//   "hasNextPage": true,
//   "prevPage": null,
//   "nextPage": 2
// }
// Create a new building
export const createBuilding = async (req, res) => {
  try {
    const buildingData = req.body;
    const building = new Building(buildingData);
    const newBuilding = await building.save();
    res.status(201).json(newBuilding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Read all buildings
export const getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find();
    res.status(200).json(buildings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all county buildings
export const getCountyBuildings = async (req, res) => {
  const county = req.params.county;
  console.log("COUNTY:",county)
  try {
    const buildings = await Building.aggregate([
      { $match: { county } },
      {
        $lookup: {
          from: "singlebusinesspermits",
          localField: "_id",
          foreignField: "building",
          as: "singleBusinessPermits",
        },
      },
    ]);
    // const buildings = await Building.find({county}).populate('singleBusinessPermits');
    if (!buildings) {
      res.status(404).json({ message: "Buildings not found" });
      return;
    }

    res.status(200).json(buildings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all ward buildings
export const getAllWardBuildings = async (req, res) => {
  const ward = req.params.ward;
  console.log("ward:",ward)
  try {
    // const buildings = await Building.aggregate([
    //   { $match: { ward } },
    //   {
    //     $lookup: {
    //       from: "singlebusinesspermits",
    //       localField: "_id",
    //       foreignField: "building",
    //       as: "singleBusinessPermits",
    //     },
    //   },
    // ]);
    const buildings = await Building.find({ward})
    if (!buildings) {
      res.status(404).json({ message: "Buildings not found" });
      return;
    }

    res.status(200).json(buildings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBuildings = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    building_number,
    ward,
    county,
    // sortField = "createdAt",
    // sortOrder = "desc",
  } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    populate: {
      path: "singleBusinessPermits",
      model: "SingleBusinessPermit",
    },
  };

  const searchFilter = {};

  if (building_number) {
    searchFilter.building_number = { $regex: building_number };
  }
  if (ward) {
    searchFilter.ward = { $regex: ward, $options: "i" };
  }

  if (county) {
    searchFilter.county = { $regex: county, $options: "i" };
  }

  try {
    const buildings = await Building.paginate(searchFilter, options);
    return res.status(200).json(buildings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getBuildingById = async (req, res) => {
  const { id } = req.params;
  const category = req.query.category;

  try {
    let building = await Building.findById(id).populate(
      "singleBusinessPermits"
    );
    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }
    if (category){
      const filteredSingleBusinessPermits = building.singleBusinessPermits.filter(
        (singleBusinessPermit) => singleBusinessPermit.business_category.toLowerCase() === category.toLowerCase() || singleBusinessPermit.payment_status.toLowerCase() === category.toLowerCase()
      );
      building.singleBusinessPermits = filteredSingleBusinessPermits
    }
    return res.status(200).json(building);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

async function getUniqueBuildingDetailsFiltered(category, county) {
  try {
    const buildings = await Building.find({ county }).select('_id');
    const buildingIds = buildings.map((building) => building._id);

    // const businesses = await SingleBusinessPermit.find({
    //   building: { $in: buildingIds },
    //   $or: [
    //     { business_category: category },
    //     { payment_status: category },
    //     { 'building.street': category },
    //   ]
      
    // }).populate('building', '_id longitude latitude');;

    const businesses = await SingleBusinessPermit.aggregate([
      {
        $match: {
          building: { $in: buildingIds },
          $or: [
            { business_category: category },
            { payment_status: category },
            { 'building.street': category },
          ]
        }
      },
      {
        $group: {
          _id: '$building',
          paid_count: {
            $sum: {
              $cond: [
                { $eq: ['$payment_status', 'Paid'] },
                1,
                0
              ]
            }
          },
          partially_paid_count: {
            $sum: {
              $cond: [
                { $eq: ['$payment_status', 'Partially Paid'] },
                1,
                0
              ]
            }
          },
          not_paid: {
            $sum: {
              $cond: [
                { $eq: ['$payment_status', 'Not Paid'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'buildings',
          localField: '_id',
          foreignField: '_id',
          as: 'building'
        }
      },
      {
        $unwind: '$building'
      },
      {
        $project: {
          _id: 0,
          building: {
            _id: '$building._id',
            longitude: '$building.longitude',
            latitude: '$building.latitude',
            paid_count: '$paid_count',
            partially_paid_count: '$partially_paid_count',
            not_paid: '$not_paid'
          }
        }
      }
    ]);


    return businesses
  } catch (error) {
    console.error('Error retrieving SingleBusinessPermits:', error);
    throw error;
  }
}

const getUniqueBuildings = async (data) => {
  const uniqueBuildings = new Map();

  for (const item of data) {
    const buildingId = item.building._id;

    // Check if the buildingId is already in the Map
    if (!uniqueBuildings.has(buildingId)) {
      // If it's not in the Map, add it as a key with the building object as the value
      uniqueBuildings.set(buildingId, item.building);
    }
  }

  // Convert the Map values back to an array
  const uniqueBuildingList = Array.from(uniqueBuildings.values());

  return uniqueBuildingList;
};


export const getAllCountyBuildings = async (req, res) => {
  const county = req.params.county;
  const businessCategory = req.query.category;
  
  try {
    let buildings = []
    if (businessCategory){
      const resp = await getUniqueBuildingDetailsFiltered(businessCategory, county) 
      buildings = await getUniqueBuildings(resp)
    } else {
      buildings = await Building.find(
        { county },
        { latitude: 1, longitude: 1, paid_count: 1, not_paid_count: 1, partially_paid_count: 1 }
      ).select("_id");
    }
    
    res.json(buildings)
  } catch (error) {
    res.status(400).json({ error: error.message });
  
  };
}

// Update a building.
export const updateBuildingById = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const updatedData = req.body;
    const updatedBuilding = await Building.findByIdAndUpdate(
      buildingId,
      updatedData,
      { new: true }
    );
    if (!updatedBuilding) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.status(200).json(updatedBuilding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a building
export const deleteBuildingById = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const deletedBuilding = await Building.findByIdAndDelete(buildingId);
    if (!deletedBuilding) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.status(200).json({ message: "Building deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
