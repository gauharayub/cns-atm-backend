const mongoose = require('mongoose')
const equipmentSchema = new mongoose.Schema({
    equipmentCode:{
         type:String,
         required:true,
         unique:true
    },
    
    equipmentNumber:{
        type:Number,
        required:true,
        unique:true
    },
     
    description:{
         type:String,
         required:true
    },
    
    image: {
        type: Buffer
    },

    name: {
        type: String,
        required:true
    },

    stateOfEquipment: {
        type:String
    },

    voltage: {
        type: Number,
        required:true
    },

    current: {
        type: Number,
        required:true
    },

    temperature: {
        type: Number,
        required:true
    },

    //maintenance plan for equipment...
    maintenancePlanList:[{type:mongoose.Schema.Types.ObjectId, ref:'MaintenancePlan'}],

    //locations where the equipment is installed.....
    location: { type:mongoose.Schema.Types.ObjectId, ref:'Location'}
})

const Equipment = mongoose.model('Equipment',equipmentSchema)

module.exports =  Equipment
