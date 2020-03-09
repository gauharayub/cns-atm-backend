const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    number:{
        type:String,
        required:true,
        unique:true
    },
    equipmentCode:{
        type:String,
        required:true
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
    location:{
        type:String,
        required:true
    },
    completed:{
        type:String,
        required:true,
        default:"No"
    },
    status:{
        type:String,
        required:true,
        default:"Unassigned"
    },
    dateOfCompletion:{
        type:Date
    },
    equipmentCode:{
        type:String,
        required:true,
    },
    cycle:{
        type:String,
        required:true
    },
    tasklist:[
        {
        type:String
        }
    ],
    workImage:
    [
        {
        type:Buffer
//Buffer type is used to store binary data(images,docs and other files) in mongodb database.....
        }
    ],
    comments:[
        {
            type:String
        }
    ]
})

const Order = mongoose.model('Order',orderSchema)

module.exports = Order