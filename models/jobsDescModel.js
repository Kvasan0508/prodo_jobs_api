const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  description: {
    type: String,
  },
});

let model = mongoose.model("job_preference", userSchema);
module.exports = model;
