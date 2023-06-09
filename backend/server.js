const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const hostelRoutes = require("./routes/hostelRoutes");
const userRoutes = require("./routes/userRoutes");

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


const connnectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    // console.log(process.env)
    await mongoose.connect(uri);
    console.log("We're connected with DB");
  } catch {
    console.log("DB not connected");
  }
};

connnectDB();

app.get('/api/env', (req, res) => {
  const environmentVariables = {
    POSTALCODE_API_KEY: process.env.REACT_APP_POSTALCODE_API_KEY,
  };
  res.json(environmentVariables);
});

app.use(hostelRoutes);
app.use(userRoutes);

app.listen(port, () => {
  console.log(`App is Listen on PORT 8080`);
});
