class Errorhandler extends Error {
    constructor(message, statuscode) {
      super(message);
      this.statuscode = statuscode;
    }
  }
  
  const HttpStatusCodes = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
  };
  
  const sendToken = (user, statuscode, res, message) => {
    const token = user.getJwtToken();
    let msg = message || "Default success message";
  
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  
    res.status(statuscode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user,
        msg,
      });
  };
  
  exports.registerUser = async (req, res, next, Model, Body) => {
    try {
      const user = await Model.create(Body);
      sendToken(user, HttpStatusCodes.CREATED, res, "User Registration Success");
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (value) => value.message
        );
        next(new Errorhandler(validationErrors.join(", "), HttpStatusCodes.BAD_REQUEST));
      } else {
        next(
          new Errorhandler(
            `Sorry, your request could not be completed ${error}`,
            HttpStatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      }
    }
  };
  
  exports.loginUser = async (req, res, next, Model) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new Errorhandler("Please enter email and password", HttpStatusCodes.UNAUTHORIZED));
      }
  
      const user = await Model.findOne({ email }).select("+password");
      if (!user) {
        return next(new Errorhandler("User Not Found", HttpStatusCodes.UNAUTHORIZED));
      }
      if (!(await user.isValidPassword(password))) {
        return next(new Errorhandler("Email and password incorrect", HttpStatusCodes.UNAUTHORIZED));
      }
  
      sendToken(user, HttpStatusCodes.CREATED, res, "Login SuccessFull");
    } catch (error) {
      return next(new Errorhandler(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  };
  
  exports.logoutUser = (req, res, next) => {
    try {
      res.cookie('token', null, {
        expires: new Date(0),
        httpOnly: true,
      }).status(HttpStatusCodes.OK)
        .json({
          success: true,
          message: 'LoggedOut',
        });
    } catch (error) {
      next(new Errorhandler("Sorry, your request could not be completed", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  };
  