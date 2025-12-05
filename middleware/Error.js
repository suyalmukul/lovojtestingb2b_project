const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  const response = {
    success: false,
    message: err.message,
    // additionalData: err.additionalData || {}, 
    stack: err.stack, // Add the stack property to the response payload
  };

  // console.log(response);

  res.status(err.statusCode).json(response);
};
module.exports = ErrorMiddleware;
