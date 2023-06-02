import mongoose from "mongoose";
// import data from "./data/makueni_buildings.js";
// import data from "./data/nairobi_buildings.js";
// import data from "./nairobi_store_data.js";
import Building from "./models/Building.js";
import User from "./models/User.js";
import SingleBusinessPermit from "./models/SingleBusinessPermit.js";
import { faker } from "@faker-js/faker";
import nodemailer from "nodemailer";
import County from "./models/County.js";
import Transaction from "./models/Transaction.js";
import {
  dataAffiliateStat,
  dataProduct,
  dataProductStat,
  dataTransaction,
} from "./data/index.js";
import ProductStat from "./models/ProductStat.js";
import Product from "./models/Product.js";
import AffiliateStat from "./models/AffiliateStat.js";
import SubCategory from "./models/SubCategory.js";
import Category from "./models/Category.js";

async function insertBuildingsData(data) {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(
      "mongodb://root:example@localhost:27017/?retryWrites=true&w=majority"
      //"mongodb+srv://steven:ixwveulacqtxxszz@cluster0.o3swyi3.mongodb.net/?retryWrites=true&w=majority"
    );

    // Create an array to hold the bulk operations
    const bulkOperations = [];

    // Insert each building data into the bulk operations array
    for (let i = 0; i < data.length; i++) {
      const buildingData = data[i];
      const {
        buildingnumber,
        numberoffloors,
        typeofstructure,
        nameofthestreet,
        descriptionofthebuilding,
        county,
        subcounty,
        ward,
        longitude,
        latitude,
      } = buildingData.properties;

      const building = new Building({
        building_number: buildingnumber.split(":")[1].trim(),
        floors: parseInt(numberoffloors.split(":")[1].trim(), 10),
        type_of_structure: typeofstructure.split(":")[1].trim(),
        street: nameofthestreet.split(":")[1].trim(),
        description: descriptionofthebuilding.split(":")[1].trim(),
        county,
        sub_county: subcounty,
        ward,
        longitude: longitude.toString(),
        latitude: latitude.toString(),
      });

      console.log("Saving: ", building.building_number);

      // Add the insert operation to the bulk operations array
      bulkOperations.push({
        insertOne: {
          document: building,
        },
      });

      // If the bulk operations array reaches 100 records or it is the last iteration, execute the bulk insert
      if (bulkOperations.length === 100 || i === data.length - 1) {
        console.log("Inserting in bulk...");
        await Building.bulkWrite(bulkOperations); // Execute the bulk insert
        bulkOperations.length = 0; // Clear the bulk operations array
      }
    }

    console.log("Buildings data inserted successfully.");
  } catch (error) {
    console.error("Error inserting buildings data:", error);
  } finally {
    // Disconnect from the MongoDB database
    await mongoose.disconnect();
  }
}

async function handleSavingStores(data, start, stop) {
  const uri =
    // "mongodb://root:example@localhost:27017/?retryWrites=true&w=majority";
    "mongodb+srv://steven:ixwveulacqtxxszz@cluster0.o3swyi3.mongodb.net/?retryWrites=true&w=majority";
  // Connect to the MongoDB database
  await mongoose.connect(uri);
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB connection lost retrying...");
    // Retry the connection after a delay
    mongoose
      .connect(uri)
      .then(() => {
        console.log("Connected");
      })
      .catch((connectError) => {
        console.log("Connection Error", connectError);
      });
  });

  try {
    // Insert each building data into the database

    for (const [idx, storeData] of data.entries()) {
      try {
        if (idx >= start) {
          var {
            subcounty,
            ward,
            nameofthestreet,
            buildingnumber,
            storenumber,
            floornumber,
            typeofbusiness,
            description,
          } = storeData;
          console.log(idx, " - BUILDING NUMBER: ", buildingnumber);

          if (buildingnumber === undefined) {
            continue;
          }
          var building = await Building.find({
            building_number: buildingnumber,
          });
          if (building.length === 0) {
            console.log(
              `xxxxxxxxxxxxxxxxx Building not found with building number -> ${buildingnumber}, length: ${building.length}`
            );
            continue;
          } else {
            console.log("found ");
          }
          // create fake user
          const fakeUser = {
            name: faker.person.fullName(),
            email: `${idx}${faker.internet.email()}`,
            password: faker.internet.password(),
            msisdn: faker.phone.number(),
            id_number: faker.helpers.rangeToNumber({
              min: 11111111,
              max: 99999999,
            }),
            user_type: "client",
            kra_brs_number: faker.helpers.rangeToNumber({
              min: 111111,
              max: 999999,
            }),
            role: faker.helpers.arrayElement([
              "governor",
              "cec",
              "director",
              "revenueOfficer",
              "management",
              "client",
            ]),
            ministry: faker.company.name(),
            county_id: subcounty,
            ward: ward,
          };
          var user = new User(fakeUser);
          user.save().then((res) => {
            console.log(`Saved User -> ${user.name} - ${user.email}`);
          });

          if (!user._id) {
            continue;
          }

          const fakeBusinessPermit = {
            application_type: "New",
            registered: false,
            business_name: faker.company.name(),
            branch_name: "main",
            floor_no: floornumber,
            store_no: storenumber,
            business_category: typeofbusiness,
            business_sub_category: "",
            business_description: description,
            no_of_employees: faker.helpers.rangeToNumber({
              min: 1,
              max: 199,
            }),
            additional_activity: "",
            premise_size: "",
            business_email: faker.internet.email(),
            business_phone: faker.phone.number(),
            postal_address: faker.location.streetAddress(),
            postal_code: faker.location.zipCode(),
            payment_status: faker.helpers.arrayElement([
              "Paid",
              "Partially Paid",
              "Not Paid",
            ]),
            is_building_open: faker.helpers.arrayElement(["open", "closed"]),
            user: user._id,
            building: building ? building[0]._id : buildingnumber,
          };

          // console.log("FAKE BUSINESS:  ->  ", fakeBusinessPermit);
          const permit = new SingleBusinessPermit(fakeBusinessPermit);
          permit
            .save()
            .then(() => {
              building[0].singleBusinessPermits.push(permit._id);
              building[0].save().catch((err2) => {
                console.log("Error Updating building list of permits", err2);
              });
              console.log(
                `--------Saved business -> building: ${building[0].building_number}`,
                permit.store_no
              );
            })
            .catch((error) => {
              console.log("Error saving:", error.message);
              User.deleteOne(user._id)
                .then(() => {
                  console.log("User deleted successfully.");
                })
                .catch((deleteError) => {
                  console.log("Error deleting user:", deleteError.message);
                });
            });
        }
        if (idx >= stop) {
          console.log("DONE THIS LOOP");
          break;
        }
      } catch (error) {
        console.log("ERRRO -> ", error, "\nSKIPPING................");
      }
    }

    console.log("businesses data inserted successfully.");
  } catch (error) {
    console.error("Error inserting buildings data:", error);
  } finally {
    // Disconnect from the MongoDB database
    await mongoose.disconnect();
  }
}

// handleSavingStores(data, process.argv[2], process.argv[3]);

//insertBuildingsData(data);

const createMe = async () => {
  const fakeUser = {
    name: "Steven Test2",
    email: `ondiekisteven2@gmail.com`,
    password: "zamo1234",
    msisdn: 2547906706366,
    id_number: 34009988,
    user_type: "client",
    kra_brs_number: faker.helpers.rangeToNumber({
      min: 111111,
      max: 999999,
    }),
    role: "client",
    ministry: "",
    county_id: "Makueni",
    ward: "Wote",
  };
  console.log("Saving me.....");
  const db = await mongoose.connect(
    "mongodb://root:example@127.0.0.1:27017?retryWrites=true&w=majority"
  );
  var user = new User(fakeUser);
  user.save().then((res) => {
    console.log(`Saved User -> ${user.name} - ${user.email}`);
  });
};

async function sendEmailWithReplyTo(from, to, subject, text, replyTo) {
  // Create a SMTP transporter
  let transporter = nodemailer.createTransport({
    host: "mail.onfonmedia.com",
    port: 465,
    secure: true, // Set it to true if you're using a secure connection (e.g., SSL/TLS)
    auth: {
      user: "alerter@onfonmedia.com",
      pass: "qMRwvWQ4)%-n",
    },
  });

  // Set up email data
  let mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text,
    replyTo: replyTo,
  };

  try {
    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// const from = 'alerter@onfonmedia.com';
// const to = 'sondieki@onfonmedia.com';
// const subject = 'Alert From Admin';
// const text = 'This is the email content.';
// const replyTo = 'ondiekisteven1@example.com';

// console.log("Sending email...")
// sendEmailWithReplyTo(from, to, subject, text, replyTo);

// handleSavingStores(data, process.argv[2], process.argv[3]);

// insertBuildingsData(data);

// createMe()

async function createIndex() {
  // Connect to your MongoDB database
  // mongoose.connect("mongodb://root:example@172.16.0.180:27017?retryWrites=true&w=majority")
  mongoose
    .connect(
      "mongodb://root:example@127.0.0.1:27017?retryWrites=true&w=majority"
    )
    .then(() => {
      console.log("Connected to MongoDB");

      // Create the index
      Building.collection.createIndex(
        { county: 1, payment_status: 1 },
        function (err, result) {
          if (err) {
            console.error("Error creating index:", err);
          } else {
            console.log("Index created successfully:", result);
          }

          // Close the database connection
          mongoose.connection.close();
        }
      );
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
}

async function updateBuildingCounts(county) {
  mongoose.connect(
    "mongodb://root:example@172.16.0.180:27017?retryWrites=true&w=majority"
  );

  console.log("Connected to MongoDB");
  try {
    // Retrieve all buildings
    const buildings = await Building.find({ county }).exec();

    // Loop through each building
    for (const building of buildings) {
      // Get the businesses associated with the building
      const businesses = await SingleBusinessPermit.find({
        _id: { $in: building.singleBusinessPermits },
      }).exec();

      // Calculate the counts of paid and not paid businesses
      let paidCount = 0;
      let notPaidCount = 0;
      let partiallyCount = 0;

      for (const business of businesses) {
        if (business.payment_status === "Paid") {
          paidCount++;
        } else if (business.payment_status === "Not Paid") {
          notPaidCount++;
        } else if (business.payment_status === "Partially Paid") {
          partiallyCount++;
        }
      }

      // Update the counts in the building document
      building.paid_count = paidCount;
      building.not_paid_count = notPaidCount;
      building.partially_paid_count = partiallyCount;

      let maxVariable;

      if (paidCount >= partiallyCount && paidCount >= notPaidCount) {
        maxVariable = "Paid";
      } else if (
        partiallyCount >= paidCount &&
        partiallyCount >= notPaidCount
      ) {
        maxVariable = "Partially Paid";
      } else {
        maxVariable = "Not Paid";
      }

      building.payment_status = maxVariable;

      // Save the updated building document

      await building.save().then(() => {
        console.log(
          "counts updated for ",
          building.building_number,
          building._id
        );
      });
    }

    console.log("Building counts updated successfully!");
  } catch (error) {
    console.error("Error updating building counts:", error);
  }
}

async function seedCounties() {
  mongoose.connect(
    "mongodb://root:example@172.16.0.180:27017?retryWrites=true&w=majority"
  );

  County.insertMany(counties)
    .then(() => console.log("counties seeded successfully"))
    .catch((e) => console.error(e));
  // seedSubcounties()
}
// seedCounties()

async function seed_transactions() {
  mongoose.connect(
    "mongodb://root:example@172.16.0.180:27017?retryWrites=true&w=majority"
  );

  AffiliateStat.insertMany(dataAffiliateStat)
    .then(() => console.log("affiliate seeded successfully"))
    .catch((e) => console.error(e));
}

async function getUniqueCategories() {
  mongoose.connect(
    "mongodb://root:example@127.0.0.1:2222?retryWrites=true&w=majority"
  );

  const new_category = new Category({name: 'General Trade'})
  new_category.save().then(() => {
    console.log("saved category")
  }).catch(() => {console.log("Skippig saving category...")})

  SingleBusinessPermit.distinct('business_category', (error, categories) => {
    if (error){
      console.log("ERROR:", error)
    } else {
      for (const category of categories){
        console.log("SUB CATEGORY; ", category)
        const sub_category = new SubCategory({name: category, price: Math.round((Math.random() * 100) + 100), category: new_category})
        sub_category.save().then(() => {
          console.log("Saved ", category, ". adding to category list")
          new_category.sub_categories.push(sub_category._id)
          new_category.save().then(() => {
            console.log("Saved category and sub category")
          }).catch((error) => {
            console.log("ERROR SAVING SUB-CATEGORY TO CATEGORY", error)
          })
        }).catch((error) => {
          console.log("ERROR SAVING SUB-CATEGORY", error)
        })
        
      }
    }
  })
    
}

getUniqueCategories()