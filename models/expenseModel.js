const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  totalAmount: {
    type: Number,
  },
  expenses: [
    {
      expenseTitle:{
        type:String
      },
      expenseAmount: {
        type:Number
      },
    },
  ],
  userId:{
    type:String
  }
});

let model = mongoose.model('expense', expenseSchema)
module.exports = model
