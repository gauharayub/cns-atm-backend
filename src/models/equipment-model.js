const mongoose = require('mongoose')
const equipmentSchema = new mongoose.Schema({
     equipmentCode:{
         type:String,
         required:true,
         unique:true
     },
     equipmentNumber:{
        type:String,
        required:true,
        unique:true
     },
     description:{
         type:String,
         required:true
     },

     //maintenance plan for equipment...
     maintenancePlanList:[{type:mongoose.Schema.Types.ObjectId, ref:'MaintenancePlan'}],

     //locations where the equipment is installed.....
     locations:[{type:mongoose.Schema.Types.ObjectId, ref:'Location'}]
})

const Equipment = mongoose.model('Equipment',equipmentSchema)

module.exports =  Equipment
