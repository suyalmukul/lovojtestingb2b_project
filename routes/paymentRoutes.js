const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to initiate a payment
paymentRouter.post('/payment/initiate', paymentController.initiatePayment);

// Route to verify a payment
paymentRouter.post('/payment/verify', paymentController.verifyPayment);

// Route to handle webhook events
paymentRouter.post('/webhook', paymentController.handleWebhook);

// Route to make payment for testing
paymentRouter.post('/makepayment', paymentController.makePayment);

module.exports = paymentRouter;
