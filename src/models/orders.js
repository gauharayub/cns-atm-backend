const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    number:{
        type:String,
        required:true,
        unique:true
    },
    assignmentCode:{
        type:String,
        required:true,
        unique:true
    },
    equip_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    work:{
        type:String,
        required:true
    },
    remarks:{
        type:String,
    },
    task:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Tasklist'
    },
    engineer_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Engineer'
    },
    completed:{
        type:String,
        required:true,
        default:"No"
    },
    status:{
        type:String,
        required:true,
        default:"No"
    },
    dateOfCompletion:{
        type:Date
    }
})

const Order = mongoose.model('Order',orderSchema)

module.exports = Order