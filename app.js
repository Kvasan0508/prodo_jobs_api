const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const serverless = require("serverless-http");
const Elite = require("./routes/elite");
const Expense = require("./routes/expense");
const Jobs = require("./routes/jobs");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const Errorhandler = require("./utils/ErrorHandler");
const ConnectDatabase = require("./config/database");
dotenv.config({ path: path.join(__dirname, "config/config.env") });

ConnectDatabase();
app.use(express.json());
app.use(cookieParser());

app.use(cors());
app.use("/api/v1/", Elite);
app.use("/api/v1/", Expense);
app.use("/api/v1", Jobs);

// error should be next step to endpoints
app.use(errorMiddleware);
app.use("*", (req, res, next) => {
  return next(new Errorhandler("The request could not be completed", 404));
});
module.exports = app;
module.exports.server = serverless(app);
