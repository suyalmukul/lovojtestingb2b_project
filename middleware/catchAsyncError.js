exports.catchAsyncError = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next))
      .catch((error) => {
        error.stack = error.stack || new Error().stack;
        next(error);
      });
  };
  