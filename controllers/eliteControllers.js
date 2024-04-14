const { registerUser, loginUser, logoutUser } = require("./loginhandlers");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middlewares/catchAsyncError");
// Register a new user
exports.registerUserreq = async (req, res, next) => {
  const { email, password } = req.body;
  const credentials = { email, password };

  await registerUser(req, res, next, User, credentials);
};

// Login user
exports.loginUserreq = async (req, res, next) => {
  await loginUser(req, res, next, User);
};

// Logout user
exports.logoutUserreq = (req, res, next) => {
  logoutUser(req, res, next);
};

// Middleware to check if the user is logged in or not
exports.checkLoggedIn = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (!authorization || !authorization.startsWith("Bearer")) {
      return res.status(401).json({ isLoggedIn: false });
    }

    // Extract the token from the authorization header
    const token = authorization.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists in the database based on the decoded ID
    const exist = await User.findById(decoded.id);
    console.log(exist);
    if (exist) {
      return res.status(200).json({ isLoggedIn: true });
    }
    return res.status(200).json({ isLoggedIn: false });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ isLoggedIn: false });
  }
};
