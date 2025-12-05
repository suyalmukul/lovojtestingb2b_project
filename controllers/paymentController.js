
const { catchAsyncError } = require('../middleware/catchAsyncError');
const PaymentDetails = require('../models/paymenDetails.model');
const PaymentService = require('../services/payment.services');
const crypto = require('crypto');

// Controller function to initiate a payment
const initiatePayment = catchAsyncError(async (req, res, next) => {
  const { amount, notes } = req.body;
  const order = await PaymentService.initiatePayment(amount, notes, next);
  res.status(200).json({ success: true, message: "RazorPay payment initiated", order });
});

// Controller function to verify a payment
const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
    console.log(req.body, "...........body...........")
  const isAuthentic = await validateSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (isAuthentic) {
    
    await PaymentDetails.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
      message: "Payment invalid!"
    });
  }
};

const validateSignature = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

// Controller function to make a payment for testing
const makePayment = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.body;
  const payment = await PaymentService.makePayment(next);
  res.status(200).json({ success: true, paymentDetails: payment });
});

// Controller function to handle webhook events
const handleWebhook = catchAsyncError(async (req, res, next) => {
  const body = req.body;
  const signature = req.headers['x-razorpay-signature'];
  await PaymentService.handleWebhook(body, signature, next);
  res.status(200).send('Webhook received');
});

module.exports = {
  initiatePayment,
  verifyPayment,
  handleWebhook,
  makePayment
};
