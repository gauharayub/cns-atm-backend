const mongoose = require('mongoose')

const tasklistSchema = new mongoose.Schema({
    item:{
        type:String,
        required:true
    },
    workDescription:{
        type:String,
        required:true
    },
    tasks:[{type:String}],
    maintenancePlan:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'MaintenancePlan'
    }
})

const Tasklist = mongoose.model('Tasklist',tasklistSchema)

module.exports = Tasklist