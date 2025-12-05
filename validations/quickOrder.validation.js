const Joi = require("joi");

const updateUserById = {
  body: Joi.object().keys({
    email: Joi.string().email(),
    name: Joi.string(),
    title: Joi.string(),
    firstName: Joi.string(),
    surname: Joi.string(),
    gender: Joi.string(),
    address: Joi.object(),
    dob: Joi.string(),
    contactNumber: Joi.string(),
    unblock_User: Joi.boolean(),
  }),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const testvalidate = {
  query: Joi.object().keys({
    id: Joi.string().required(),
    email: Joi.string().required()
  }),
}

const getCustomerOrderStatusForCutterSchema = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    // Add any other query parameters here
  }),
};

const updateCutterStatusSchema = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    productId: Joi.string().required(),
    productID:Joi.string(),
    status: Joi.string().valid('InProgress', 'Completed').required(),
    problem: Joi.boolean().allow('').optional(),
    problemStatements: Joi.array().optional(),
    workVideo: Joi.string().optional(),
    workPhoto: Joi.string().optional(),
    PendingAmount: Joi.string().optional(),
    role:Joi.string().valid('cutter', 'mastertailor','stitching','QC','delivery','admin','stylish'),
    editedRole:Joi.string().valid('admin','stylish')
  }),
};
const orderDetailsByOrderNumberSchema = {
  query: Joi.object().keys({
    type: Joi.string().valid('Offline', 'Online').required().messages({
      'any.only': 'Type must be either "Offline" or "Online"'
    }),
    orderNumber: Joi.string(),
    customerId: Joi.string(),
  }),
};
const notAssignedProductsSchema = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

const myOrdersForWorkerSchema = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
    status: Joi.string().valid('InProgress', 'Completed').required(),
  }),
};

const orderListingforWorkersSchema = {
  query: Joi.object().keys({
    page: Joi.string(),
    limit: Joi.string(),
    orderId: Joi.string(),
    active: Joi.string().valid('true', 'false'),
  }),
};
const orderDetailsByOrderNumberTestSchema = {
  query: Joi.object().keys({
    type: Joi.string().valid('Offline', 'Online'),
    orderNumber: Joi.string(),
    customerId: Joi.string(),
  }),
};

const deleteProductDetailsSchema = {
  body: Joi.object().keys({
    itemId: Joi.string().required(),
    orderId: Joi.string().required(),
    arrayName: Joi.string().valid('customerProduct', 'customerMeasurement', 'customerContrast', 'customerSpecialInstruction'),
  }),
};

const getCustomerListing1Schema = {
  query: Joi.object().keys({
    page: Joi.string(),
    limit: Joi.string(),
    orderId: Joi.string(),
    active: Joi.string().valid('true', 'false'),
    status: Joi.string().valid('true', 'false'),
    qcstatus: Joi.string().valid('Completed'),
    inProgress: Joi.string().valid('inProgress'),
    fromDate: Joi.date(),
    toDate: Joi.date(),
  }),
};

const accpetAppointmentStylishSchema = {
  body: Joi.object().keys({
    storeId: Joi.string().required(),
    orderNumber: Joi.string().required(),
    customerID: Joi.string().required(),
    productID: Joi.string().required(),
    otp: Joi.string().required(),
    mobileNumber: Joi.string().required(),
    status: Joi.string().valid('InProgress', 'Completed').required(),
    type: Joi.string().valid('InPerson', 'Online').required()
  }),
};


module.exports = { 
  testvalidate, 
  getCustomerOrderStatusForCutterSchema, 
  updateCutterStatusSchema,
  orderDetailsByOrderNumberSchema,
  notAssignedProductsSchema,
  myOrdersForWorkerSchema,
  orderListingforWorkersSchema,
  orderDetailsByOrderNumberTestSchema,
  deleteProductDetailsSchema,
  getCustomerListing1Schema,
  accpetAppointmentStylishSchema
}