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
    equip:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Equipment'
    },
    tasks:{type:mongoose.Schema.Types.ObjectId,ref:'Tasklist'}
})

const MaintenancePlan = mongoose.model('MaintenancePlan',maintenanceSchema)

module.exports = MaintenancePlan