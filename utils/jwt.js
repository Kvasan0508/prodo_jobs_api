const sendToken = (user, statuscode, res) => {
  const token = user.getJwtToken();

  // cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.status(statuscode).cookie("token", token, options).json({
    success: true,
    token,
    user
  });
};

module.exports = sendToken;
