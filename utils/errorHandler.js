class AppError extends Error {
    constructor(message, statusCode, additionalData = {}) {
      super(message);
      this.statusCode = statusCode;
      // Assigning additional data to the instance
    // this.additionalData = additionalData;
      this.stack = new Error().stack;
    }
  }
  
module.exports= AppError;
  
  