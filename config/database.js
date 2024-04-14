const mongoose = require("mongoose");

let dbConnection; // Variable to store the database connection

const ConnectDatabase = () => {
  try {
    mongoose
      .connect(process.env.DB_LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((con) => {
        console.log(
          `MongoDB database connected with HOST:  ${con.connection.host}`
        );
        dbConnection = con; // Store the connection in the global variable
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports = ConnectDatabase;
