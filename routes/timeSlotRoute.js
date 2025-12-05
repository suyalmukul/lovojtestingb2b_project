const express = require("express")
const { jwtAuthCommon, jwtAuthSuperAdmin } = require("../middleware/jwtAuth");
const { createTimeSlot, getAllTimeSlots, updateTimeSlot, deleteTimeSlot, addUnavailability, addPreference, getPreference, getAvailableTimeSlot } = require("../controllers/timeSlotController")
const timeSlotRouter = express.Router()
timeSlotRouter.post("/",jwtAuthSuperAdmin,createTimeSlot)
timeSlotRouter.get("/",jwtAuthSuperAdmin,getAllTimeSlots)
timeSlotRouter.put("/:id",jwtAuthSuperAdmin,updateTimeSlot)
timeSlotRouter.delete("/:id",jwtAuthSuperAdmin,deleteTimeSlot)
timeSlotRouter.post('/unavailability',jwtAuthCommon,addUnavailability)
timeSlotRouter.post('/preferences',jwtAuthSuperAdmin,addPreference)
timeSlotRouter.get('/preferences/:stylist_id',jwtAuthSuperAdmin,getPreference)
timeSlotRouter.get('/available',jwtAuthSuperAdmin,getAvailableTimeSlot)
module.exports=timeSlotRouter
