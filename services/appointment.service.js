const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/errorHandler');
const OTPStylish = require('../models/OTPStylish.model');
const CustomerAppointment = require('../models/UserApoinmentForMeasurment');
const StylishLogs = require('../models/Stylish.model');


const handleDirectAppointment = async ({ workerId, appointmentId, type, otp, mobileNumber, status }) => {
    const otpType = status === 'InProgress' ? 'startOtp' : status === 'Completed' ? 'endOtp' : null;
  
    if (!otpType) {
      throw new AppError("Invalid status provided", 400);
    }
  
    await verifyAppointmentOtp(mobileNumber, otp, otpType);
  
    if (status === 'Completed') {
      return await handleCompletedStatus(appointmentId, workerId);
    }
  
    if (status === 'InProgress') {
      return await handleInProgressStatus(appointmentId, workerId, type);
    }
  
    throw new AppError("Invalid operation", 400);
  };

  const verifyAppointmentOtp = async (mobileNumber, otp, otpType) => {
    const otpDocument = await OTPStylish.findOne({ mobileNumber, type: otpType }).sort({ createdAt: -1 });
  
    if (!otpDocument) {
      throw new AppError("OTP not found", 400);
    }
  
    const isOtpValid = await bcrypt.compare(otp, otpDocument.otp);
  
    if (!isOtpValid) {
      throw new AppError("Invalid OTP", 400);
    }
  
    const isOtpExpired = Date.now() > otpDocument.createdAt.getTime() + 900000; // 15 minutes expiry
  
    if (isOtpExpired) {
      throw new AppError("OTP has expired", 400);
    }
  
    if (otpDocument.isUsed) {
      throw new AppError("OTP has already been used", 400);
    }
  
    otpDocument.isUsed = true;
    await otpDocument.save();
  
    return otpDocument;
  };


const handleCompletedStatus = async (appointmentId, workerId) => {
    const appointment = await CustomerAppointment.findOne({_id: new ObjectId(appointmentId), isCancelled: false});
  
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }
  
    if (!appointment.orderNumber) {
        throw new AppError("Order not added", 400);
    }
  
    const workerLog = await StylishLogs.findOne({ appointmentId: new ObjectId(appointmentId), workerId });
  
    if (workerLog) {
        workerLog.orderStatus = true;
        appointment.orderStatus = true;
        appointment.measurmentpresent = true;
        await Promise.all([workerLog.save(), appointment.save()]);
        return { success: true, message: 'Order completed successfully' };
    }
  
    throw new AppError("Worker log not found", 400);
};

const handleInProgressStatus = async (appointmentId, workerId, type,mobileNumber) => {
    const appointment = await CustomerAppointment.findOne({_id: new ObjectId(appointmentId), isCancelled: false});
  
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }
  
    const workerLog = await StylishLogs.create({
        workerId,
        appointmentId: new ObjectId(appointmentId),
        type,
    });
  
    if (workerLog) {
        appointment.acceptappointement = true;
        await appointment.save();


      //   // Send SMS notification if the mobile number is provided
      //   if (mobileNumber) {
      //     const message = `Your appointment (ID: ${appointment._id}) has been successfully booked for ${appointment.appointmentDate}. Please be available at the scheduled time.Please visit https://www.lovoj.com`;

      //     const sms = await sendSMS(
      //         message,
      //         `91${mobileNumber}`,
      //         "Lovoj",
      //         process.env.AWS_ENTITY_ID,
      //         process.env.STYLISH_ACCEPT_SMS_AWS_TEMPLATE_ID
      //     );
      // }
        
        return { success: true, message: 'Appointment accepted successfully' };
    }
  
    throw new AppError("Failed to create worker log", 400);
};

  
  module.exports = {
    handleDirectAppointment
  }
