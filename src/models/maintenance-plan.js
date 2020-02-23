const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
    cycle:{
        type:String,
        required:true,
        default:"1 month"
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