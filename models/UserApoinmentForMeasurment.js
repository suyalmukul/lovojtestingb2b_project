const mongoose = require('mongoose');

const customerAppointmentSchema = new mongoose.Schema({
    storeID: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
    customerID: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineCustomers" },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerProductOnline" },
    orderNumber: { type: String },
    AppointementId:{ type: String},
    isCancelled: {
        type: Boolean,
        default: false
    },
    orderStatus: { type: Boolean,default : false },
    measurmentpresent: { type: Boolean,default : false },
    acceptappointement: { type: Boolean,default : false },
    appointmentDate: {
        type: String,
        // required: true,
    },
    appointmentTimeSlot: {
        type: String,
        // required: true,
    },
    onlineAppointment: {
        type: Boolean,
      },
    offlineAppointment: {
        type: Boolean,
    },
    onlineAppointmentForWholeProcess: {
        type: Boolean,
    },
    offlineAppointmentForWholeProcess: {
        type: Boolean,
    },
    serviceCharges: {
        type: Number,
    },
    CustomerName:{
        type:String,
    },
    CustomerNumber:{
        type:String,
    },
    CustomerWhatsappNumber:{
        type:String,
    },
    CustomerEmail:{
        type:String,
    },
    location:{
        type:String,
    },
    customerFullAddress:{
        type:String,
    },
    Description:{
        type:String,
    }
}, {
    timestamps: true
});


const CustomerAppointment = mongoose.model('CustomerAppointment', customerAppointmentSchema);

module.exports = CustomerAppointment;


