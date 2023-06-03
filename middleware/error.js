// [HANDLE ERROR - NOT TO WRITE IF(!FOUND) AGAIN AND AGAIN]

const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // [WRONG MONGODB ID ERROR]
  if (err.name === "CastError") {
    const message = `RESOURCE NOT FOUND. INVALID: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // [MONGOOSE DUPLICATE KEY ERROR]
  if (err.code === "11000") {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // [WRONG JWT ERROR]
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  // [Expire JWT ERROR]
  if (err.name === "TokenExpiredError") {
    const message = `Json web token is expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({ success: false, message: err.message });
};
