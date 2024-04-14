const path = require('path')
const Expense = require("../models/expenseModel");
const sendToken = require("../utils/jwt");

exports.addExpense = async (req, res, next) => {
  const { totalAmount, expenses, userid } = req.body;
  const uuid = req.user.id
  console.log(uuid)

  const Body = { totalAmount: totalAmount, expenses: expenses, userId: uuid };
  const expenseFind = await Expense.findOne({ userId: uuid });
  console.log(expenseFind);
  let data;
  if (!expenseFind) {
    data = await Expense.create(Body);
  } else {
    data = await Expense.findOneAndUpdate({ userId: uuid }, Body);
  }
  res.status(200).json({
    success: true,
    expensedata: data,
  });
};

exports.getExpense = async (req, res, next) => {
  const uuid = req.user.id

  const ExpenseData = await Expense.findOne({userId: uuid});
  res.status(200).json({
    success: true,
    expensedata: ExpenseData,
  });
};
