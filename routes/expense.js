const express = require("express");
const path = require('path')
const eexpenseControllersPath = path.join(__dirname, '../controllers/expenseControllerrs');

const {getExpense,addExpense} = require(eexpenseControllersPath);

const middlerwarePath = path.join(__dirname,"../middlewares/authenticate")

const {
  isAuthenticated,
  authorizeRoles,
} = require(middlerwarePath);

const router = express.Router();

router.route("/expense/get").get(isAuthenticated,getExpense);
router.route("/expense/add").post(isAuthenticated,addExpense);

// router
//   .route("/elite/getall")
//   .get(isAuthenticated, authorizeRoles("elite"), getAllUsers);

module.exports = router;
