const Joi = require("joi");
const pick = require("../utils/pick");
const AppError = require("../utils/errorHandler");

const validateMiddleWare = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message.replace(/"/g, ''))
        .join(", ");
      const fieldErrors = error.details.map((details) => details.context.key).join(", ");
      let message = { errorMessage, bodyFields: fieldErrors}
      return next(new AppError(errorMessage, 400));
    }
  Object.assign(req, value);
  return next();
};

module.exports = validateMiddleWare;