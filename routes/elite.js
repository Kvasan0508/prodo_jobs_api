const express = require("express");
const path =require('path')
const eliteControllersPath = path.join(__dirname, '../controllers/eliteControllers');
const middlerwarePath = path.join(__dirname,"../middlewares/authenticate")
const {
  registerUserreq,
  loginUserreq,
  logoutUserreq,
  checkLoggedIn
} = require(eliteControllersPath);
const {
  isAuthenticated,
  authorizeRoles,
} = require(middlerwarePath);

const router = express.Router();

router.route("/elite/Register").post(registerUserreq);
router.route("/elite/login").post(loginUserreq);
router.route("/elite/logout").get(logoutUserreq);
router.route("/elite/isLoggedin").get(checkLoggedIn);


// router
//   .route("/elite/getall")
//   .get(isAuthenticated, authorizeRoles("elite"), getAllUsers);

module.exports = router;
