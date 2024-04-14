// module.exports = (err, req, res, next) => {
//     err.statusCode = err.statusCode || 500;

//     if (process.env.NODE_ENV === 'development') {
//         let message = err.message;
//         let error = { ...err };

//         if (err.name === "Validation Error") {
//             message = Object.values(err.errors).map(value => value.message);
//             error = new Error();
//           }
//         res.status(err.statusCode).json({
//             success: false,
//             message: message,
//         });
//     }

//     if (process.env.NODE_ENV === 'production') {
//         let message = err.message;
//         let error = { ...err };

//         if (err.name === "Validation Error") {
//           message = Object.values(err.errors).map(value => value.message);
//           error = new Error();
//         }

//         res.status(err.statusCode).json({
//             success: false,
//             message: message
//         });
//     }
// };
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    let message = err.message;
  
    if (err.name === "Validation Error") {
      message = "Validation failed. Please check your input.";
      err = new Error();
    }
  
    const response = {
      success: false,
      message: message
    };
  
    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
      response.error = err;
    }
  
    res.status(err.statusCode).json(response);
  };
  