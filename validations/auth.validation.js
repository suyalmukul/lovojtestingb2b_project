const Joi = require("joi");

const checkEmailSchema = {
    body: Joi.object().keys({
      type: Joi.string(),
      email: Joi.string().email().optional(), // Corrected: Call required() after email()
      mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
      countryCode: Joi.string()
    }),
  };


  const signupJoiSchema = {
    body: Joi.object().keys({
      otp_key: Joi.string().required(),
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
      storeType: Joi.string().required(),
      password: Joi.string().required(),
      countryCode: Joi.string()
    }),
  };
  
  const signupDesignerJoiSchema = {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
      storeType: Joi.string().required(),
      password: Joi.string().required(),
      countryCode: Joi.string(),
      created_by: Joi.string().default('super_admin'),
      working_locations: Joi.array().items(Joi.string()).optional(),
      location:Joi.string().optional()
    }),
  };
  module.exports = {
    checkEmailSchema,
    signupJoiSchema,
    signupDesignerJoiSchema
  }