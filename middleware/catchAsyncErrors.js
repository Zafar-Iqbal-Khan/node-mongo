// [CATCH ASYNC ERROR -- NOT TO WRITE TRY-CATCH AGAIN AND AGAIN]

module.exports = (catchAsyncError) => (req, res, next) => {
  Promise.resolve(catchAsyncError(req, res, next)).catch(next);
};
