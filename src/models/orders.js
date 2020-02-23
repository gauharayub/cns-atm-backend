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
        // unique:true
    },
    equipment:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Equipment'
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
    engineer:{
        type:mongoose.Schema.Types.ObjectId,
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
    },
    workImage:{
        type:Buffer
//Buffer type is used to store binary data in mongodb database.....
    }

})

const Order = mongoose.model('Order',orderSchema)

module.exports = Order