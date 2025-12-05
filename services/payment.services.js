const Razorpay = require('razorpay');
const AppError = require('../utils/errorHandler');
const PaymentDetails = require('../models/paymenDetails.model');

// console.log(process.env, 'process.env...............')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET
});

// Function to initiate a payment
const initiatePayment = async (amount, notes, next) => {
    try {
        const paymentOptions = {
            amount: amount *100, // amount in the smallest currency unit
            currency: 'INR',
            // receipt: receipt,
            notes: notes
        };
        const payment = await razorpay.orders.create(paymentOptions);
        return payment;
    } catch (error) {
        console.log(error,".....in catch.....")
        return next(new AppError(`Error initiating payment: ${error.message}`, 400));
    }
}

// Function to verify a payment
const verifyPayment = async (paymentId, orderId, paymentSignature, next) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        if (payment.order_id === orderId && razorpay.utils.verifyPaymentSignature(payment, paymentSignature)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return next(new AppError(`Error verifying payment: ${error.message}`, 400));
    }
}

const makePayment = async (next) => {
    try {
        // Simulate payment using test card details
        const payment = razorpay.payments.capture('PAYMENT_ID', 1000); // Use actual payment ID
        return payment;
    } catch (error) {
        console.error('Error making payment:', error);
        throw new Error('Error making payment');
    }
};


// Function to handle Razorpay webhook events
const handleWebhook = async (body, signature, next) => {
    const isValidSignature = razorpay.webhooks.validateWebhookSignature(body, signature, 'YOUR_WEBHOOK_SECRET');
    if (isValidSignature) {
        // Handle the webhook event
        const event = JSON.parse(body);
        console.log('Webhook Event:', event);

        // Extract relevant payment details from the webhook event
        //   const { payment_id, order_id, amount, currency, notes, status } = event.payload.payment.entity;

        //   // Save payment details to the database based on status
        //   try {
        //     if (status === 'captured' || status === 'authorized' || status === 'refunded') {
        //       const paymentDetails = new PaymentDetails({
        //         paymentId: payment_id,
        //         orderId: order_id,
        //         amount: amount,
        //         currency: currency,
        //         notes: notes,
        //         status: status
        //       });
        //       await paymentDetails.save();
        //     }
        //   } catch (error) {
        //     return next(new AppError('Error saving payment details: ' + error.message, 500));
        //   }

        return true; // Indicate successful handling of the webhook event
    } else {
        return next(new AppError('Invalid webhook signature', 400));
    }
}


module.exports = {
    initiatePayment,
    verifyPayment,
    handleWebhook,
    makePayment
};
