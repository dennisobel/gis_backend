import Building from "../models/Building.js";

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
export const getAllCountyBuildings = async (req, res) => {
  const county = req.params.county;
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
  if (ward){
    searchFilter.ward = { $regex: ward, $options: "i" }
  }

  try {
    const buildings = await Building.paginate(searchFilter, options);
    res.status(200).json(buildings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getBuildingById = async (req, res) => {
  const { id } = req.params;
  try {
    const building = await Building.findById(id).populate('singleBusinessPermits');
    if (!building) {
      res.status(404).json({ message: "Building not found" });
      return;
    }
    res.status(200).json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a building
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

