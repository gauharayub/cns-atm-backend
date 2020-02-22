const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
    dateOfCreation:{
        type:Date,
        required:true,
        default:Date.now
    },
    cycle:{
        type:String,
        required:true,
    },
    equipment:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Equipment'
    },
    task:{type:mongoose.Schema.Types.ObjectId,ref:'Tasklist'}
},{
    timestamps:true
})

const MaintenancePlan = mongoose.model('MaintenancePlan',maintenanceSchema)

module.exports = MaintenancePlan