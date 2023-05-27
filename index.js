import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import businessRoutes from "./routes/business.js"
import countyRoutes from "./routes/county.js"
import buildingsRoutes from "./routes/building.js"
import transactionsRoutes from "./routes/transactions.js"
import wardRoutes from "./routes/wards.js"

// data imports
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import County from "./models/County.js";
import SubCounty from "./models/SubCounty.js";
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
  counties
} from "./data/index.js";
import connect from "./database/conn.js";


/**CONFIGURATION */
dotenv.config();
const app = express();  

app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/**ROUTES */
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/business", businessRoutes)
app.use("/county",countyRoutes)
app.use("/buildings",buildingsRoutes)
app.use("/transactions",transactionsRoutes)
app.use("/wards",wardRoutes)

/**MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;

// const seedSubcounties = async () => {
//   try {
    
//     const makueniCounty = await County.findOne({ code: "017" }); 
//     if (!makueniCounty) {
//       throw new Error("Makueni County not found in the database.");
//     }

//     const subcountyData = [
//       { name: "Kilungu", code: "01701", county: makueniCounty._id },
//       { name: "Mbooni", code: "01702", county: makueniCounty._id },
//       { name: "Kaiti", code: "01703", county: makueniCounty._id },
//       { name: "Makueni", code: "01704", county: makueniCounty._id },
//       { name: "Kibwezi East", code: "01705", county: makueniCounty._id },
//       { name: "Kibwezi West", code: "01706", county: makueniCounty._id },
//     ];

//     await SubCounty.deleteMany({}); // Clear existing subcounty data
//     await SubCounty.insertMany(subcountyData); // Insert new subcounty data
//     console.log("Subcounty data seeded successfully!");
//     process.exit(0); // Exit the script
//   } catch (error) {
//     console.error("Error seeding subcounty data:", error);
//     process.exit(1); // Exit with an error
//   }
// };

/** start server only when we have valid connection */
connect()
  .then(() => {
    try {
      app.listen(PORT, () => {
        console.log(`Server connected to http://localhost:${PORT}`);
      });
      // ONLY ADD DATA ONE TIME
      // County.insertMany(counties)
      // .then(() => console.log("counties seeded successfully"))
      // .catch(e => console.error(e))
      // seedSubcounties()
    } catch (error) {
      console.log("Cannot connect to the server");
    }
  })
  .catch((error) => {
    console.log(error)
    console.log("Invalid database connection...!");
  });
