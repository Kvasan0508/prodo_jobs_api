const sendToken = require("./jwt");
const sendEmail = require("./email");
const crypto = require("crypto");
const ErrorHandler = require("./ErrorHandler");
var chargebee = require("chargebee");

// const sendToken = require("./jwt");
// const sendEmail = require("./email");
// const crypto = require("crypto");
// const ErrorHandler = require("./errorHandler");
// const chargebee = require('chargebee')
/**
  *  * This (Auth) Class Is Used To Create The Authentication Flow
  *  ! It Should Extends ErrorHandler Class To Handle The Errors
  *  ^ It Has All The Required Functions TO Create A Basic Authentication
  *  TODO: To Create The Cookie Securing Mechanism To Prevent From Cookie Hijacking

  */

class Auth extends ErrorHandler {
  /**
   *
    *  * This (registerUser) Function Allows The User To Create The Signup Flow
    *  ! Must Be Called With Required Parameters
    *  @params req : req,res,next,Model,Body
    *  @req : This Parameter Contains The Request Send From The Client
    *  @res : This parameter Contains The Response Sent From The Client
    *  @next : This Parameter is used to pass control to the next middleware function
    *  @Modal : This is The Database Schema To be Passed To The Function To Select The Database
    *  @Body : This Contains The Values TO Be Inserted In The Database
    *  Description: This is an async function that registers a user, sends an email verification link, and returns a token.

  **/

  async registeruser(req, res, next, Model, Body) {
    try {
      const user = await Model.create(Body);
  
      const { email, password } = Body;
  
      try {
        const result = await new Promise((resolve, reject) => {
          chargebee.customer.create({ email: email }).request(function (
            error,
            result
          ) {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
  
        console.log(result);
        var customer = result.customer;
        var card = result.card;
  
        console.log("", result);
        console.log(customer.id);
        var chargebeeIdData = customer.id;
        console.log(chargebeeIdData);
        user.chargebeeId = chargebeeIdData;
        await user.save({ validateBeforeSave: false });
        user.password = undefined;
        user.isVerifyToken = undefined;
        user.isVerifyTokenExpire = undefined;
        sendToken(user, 201, res);
      } catch (err) {
        console.error(err); // Log the error object
        console.error(err.message); // Log the error message specifically
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });
  
        return next(new ErrorHandler(err, 404));
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (value) => value.message
        );
        next(new ErrorHandler(validationErrors.join(", "), 500));
      } else {
        next(
          new ErrorHandler(
            `Sorry, your request could not be completed ${error}`,
            500
          )
        );
      }
    }
  }
  

  /**
   *    * This (loginUser) Function Allows The User To Initiate The Login  Flow
   *    ! Must Be Called With Required Parameters
   *    @params : req,res,next,Model,Body
   *    @req : This Parameter Contains The Request Send From The Client
   *    @res : This parameter Contains The Response Sent From The Client
   *    @next : This Parameter is used to pass control to the next middleware function
   *    @Modal : This is The Database Schema To be Passed To The Function To Select The Database
   *    Description : This is an asynchronous function that logs in a user by checking their email and password,
   *    * verifying their email status, and sending a token for authentication.
   */

  async loginUser(req, res, next, Model) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("please enter email and password", 400));
      }
      // finding in db
      const user = await Model.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler(" email and password incorrect", 401));
      }
      if (!(await user.isValidPassword(password))) {
        return next(new ErrorHandler("email and password incorrect", 401));
      }
      const verified = user.isVerified();
      if (verified == true) {
        const messages = `User ${user.email} is  verified `;
        user.password = undefined;
        user.isVerifyToken = undefined;
        user.isVerifyTokenExpire = undefined;

        sendToken(user, 201, res);
      } else {
        const IsVerified = user.getVerifyToken();
        await user.save({ validateBeforeSave: false });
        user.password = undefined;

        try {
          sendToken(user, 201, res);
        } catch (error) {
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpire = undefined;
          await user.save({ validateBeforeSave: false });
          return next(new ErrorHandler(error.message), 500);
        }
      }
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  }

  /**
         *  * This (logoutUser) Function Allows The User To  Logout and Clears The Current Sessions Of The User
         *  ! Must Be Called With Required Parameters
         *  @params : req,res,next,Model,Body
         *  @req : This Parameter Contains The Request Send From The Client
         *  @res : This parameter Contains The Response Sent From The Client
         *  @next : This Parameter is used to pass control to the next middleware function
         *  Description : The function logs out a user by setting the token cookie to null and returning a success
         * *   message.


        */

  logoutUser(req, res, next) {
    try {
      res
        .cookie("token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
        })
        .status(200)
        .json({
          success: true,
          message: "LoggedOut",
        });
    } catch (error) {
      next(new ErrorHandler(`sorry Your request could not be completed`));
    }
  }

  /**
   *  * This (forgotPassword) Function Allows The User To Change The Password By Receiving a Token In Email
   *  ! Must Be Called With Required Parameters
   *  @params : req,res,next,Model,Body
   *  @req : This Parameter Contains The Request Send From The Client
   *  @res : This parameter Contains The Response Sent From The Client
   *  @next : This Parameter is used to pass control to the next middleware function
   *  @Modal : This is The Database Schema To be Passed To The Function To Select The Database
   *  Description : If the user is not found in the database, an error message with status code 404 is
   *    * returned. If the email is successfully sent to the user, a success message with status code 200
   *    * is returned. If there is an error sending the email, an error message with status code 500 is
   *    * returned. If there is an error in the try block, an error message with status code 500
   */

  async forgotPassword(req, res, next, Model) {
    try {
      const user = await Model.findOne({ email: req.body.email });
      if (!user) {
        return next(new ErrorHandler("email not found in database", 404));
      }
      const getResetToken = user.getResetToken();
      await user.save({ validateBeforeSave: false });

      //  create reset url
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/password/reset/${getResetToken}`;
      const message = `Your password reset token url is as follow\n\n
                ${resetUrl}\n\n if you have not requested this email then ignore it`;
      try {
        sendEmail({
          email: user.email,
          subject: "ouidily password recovery",
          message,
        });
        res.status(200).json({
          success: true,
          message: `email send to ${user.email}`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message), 500);
      }
    } catch (error) {
      next(new ErrorHandler(`Sorry Your Request Could Not Be Completed`, 500));
    }
  }
  /**
   *  * This (resetPassword) Function Allows The User To Create The Reset The password Using The Token
   *  ! Must Be Called With Required Parameters
   *  @params : req,res,next,Model,Body
   *  @req : This Parameter Contains The Request Send From The Client
   *  @res : This parameter Contains The Response Sent From The Client
   *  @next : This Parameter is used to pass control to the next middleware function
   *  @Modal : This is The Database Schema To be Passed To The Function To Select The Database
   *  Description :If the user is not found, an error message "password reset token is invalid or expired"
   *   * is returned. If the password and confirmPassword do not match, an error message "password does
   *   * not match" is returned. If there are no errors, a token is sent with a status code of 201.
   */

  async resetPassword(req, res, next, Model) {
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
      const user = await Model.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: {
          $gt: Date.now(),
        },
      });
      if (!user) {
        return next(
          new ErrorHandler("password reset token is invalid or expired")
        );
      }
      if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match"));
      }
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      sendToken(user, 201, res);
    } catch (error) {
      next(error);
    }
  }

  /**
   *  * This (verifyUser) verifies a user's token and updates their verification status in the database.
   *  ! Must Be Called With Required Parameters
   *  @params : req,res,next,Model,Body
   *  @req : This Parameter Contains The Request Send From The Client
   *  @res : This parameter Contains The Response Sent From The Client
   *  @next : This Parameter is used to pass control to the next middleware function
   *  @Modal : This is The Database Schema To be Passed To The Function To Select The Database
   *  Description :If the user is not found, an error message is returned with the message "verification
   *  * token is invalid or expired". If the user is found and successfully verified, a token is sent
   *  * with a status code of 201.
   */

  async verifyUser(req, res, next, Model) {
    try {
      const isVerifyToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
      const user = await Model.findOne({
        isVerifyToken,
        isVerifyTokenExpire: {
          $gt: Date.now(),
        },
      });
      if (!user) {
        return next(
          new ErrorHandler("verification token is invalid or expired")
        );
      }
      user.isVerfied = true;
      user.isVerifyToken = undefined;
      user.isVerifyTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      sendToken(user, 201, res);
    } catch (error) {
      next(error);
    }
  }

  async updatePhoneNumber(req, res, next, Model, Body) {
    try {
      let user = await Model.findById(req.user.id);
      if (!user) {
        return next(new ErrorHandler("Product not found in the database", 400));
      }
      user = await Model.findByIdAndUpdate(req.user.id, Body, {
        new: true,
        runValidators: true,
      });
      const { phonenumber } = Body;
      const customerId = user.getChargebeeID();
      const updatedData = {
        phone: phonenumber,
      };

      chargebee.customer
        .update(customerId, updatedData)
        .request(function (error, result) {
          if (error) {
            console.error("Error updating customer:", error);
            return;
          }

          const updatedCustomer = result.customer;
          console.log("Customer updated:", updatedCustomer);
          res.status(200).json({
            success: true,
            user,
            updatedCustomer,
          });
        });
    } catch (error) {
      next(
        new ErrorHandler(`Sorry We Have a ${error} In The Above Request`, 404)
      );
    }
  }

  async updateZipcode(req, res, next, Model1, Model2, Model3, Body) {
    try {
      const { zipcode } = Body;
      var userId = req.user.id;
      const zipcodeFound = await Model1.findOne({ zipcode });
      if (zipcodeFound) {
        const ZipFound = await Model2.findOne({ customerId: userId });
        if (ZipFound) {
          const Address = await Model2.findOneAndUpdate(
            { customerId: userId },
            { zipcode },
            { new: true, runValidators: true }
          );
        } else {
          const Zipcode = await Model2.create({
            zipcode,
            customerId: req.user.id,
          });
        }

        console.log(userId);
        async function getAddressFieldById() {
          try {
            const chargebeeIdData = await Model3.findById(userId)
              .select("chargebeeId")
              .exec();

            if (chargebeeIdData) {
              const customerId = chargebeeIdData.chargebeeId;

              chargebee.customer
                .update_billing_info(customerId, {
                  billing_address: {
                    zip: zipcode,
                  },
                })
                .request(function (error, result) {
                  if (error) {
                    //handle error
                    console.log(error);
                  } else {
                    console.log(result);
                    var customer = result.customer;
                  }
                  res.status(200).json({
                    success: true,
                    customer,
                  });
                });
            } else {
              console.log("Address not found");
            }
          } catch (error) {
            console.error(error);
          }
        }

        getAddressFieldById();
      } else {
        next(
          new ErrorHandler("Delivery Is Not Available In Your Zipcode", 404)
        );
      }
    } catch (error) {
      next(
        new ErrorHandler(`Sorry We Have a ${error} In The Above Request`, 404)
      );
    }
  }
}
module.exports = new Auth();
