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
import postRoutes from "./routes/posts.js";
import categiresRoutes from "./routes/categories.js";


import connect from "./database/conn.js";
import Auth from "./middleware/auth.js";
import {checkHeaderMiddleware} from "./middleware/check_location.js";
import {event_it, event_store_activity} from "./middleware/event_it.js";


/**CONFIGURATION */
dotenv.config();
const app = express();  

app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(checkHeaderMiddleware)
// app.use(event_it)

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
app.use("/business", Auth, event_store_activity, businessRoutes)
app.use("/county",countyRoutes)
app.use("/buildings",buildingsRoutes)
app.use("/transactions",transactionsRoutes)
app.use("/wards",wardRoutes)
app.use("/posts", postRoutes);
app.use("/categories", categiresRoutes);

/**MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;


/** start server only when we have valid connection */
connect()
  .then(() => {
    try {
      app.listen(PORT, () => {
        console.log(`Server connected to http://localhost:${PORT}`);
      });
      // ONLY ADD DATA ONE TIME

    } catch (error) {
      console.log("Cannot connect to the server");
    }
  })
  .catch((error) => {
    console.log(error)
    console.log("Invalid database connection...!");
  });
