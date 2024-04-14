const jwt = require("jsonwebtoken");

const User = require('../models/userModel')
const Errorhandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return next(new Errorhandler('login first into this resource', 401));
    }

    // Extract the token without the "Bearer " prefix
    const token = authorization.split(" ")[1];

    // Add a log statement to check the token value

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add a log statement to check the decoded data

    req.user = await User.findById(decoded.id);

    // Add a log statement to check the user data
    console.log("User:", req.user);

    next();
  } catch (error) {
    // Add a log statement to check any errors
    console.error("Authentication Error:", error);
    next(new Errorhandler('login first', 400));
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new Errorhandler(`Role  ${req.user?.role} is not allowed`, 401));
    }
    next();
  };
};
