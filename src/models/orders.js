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
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'Tasklist'
    },
    engineer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Engineer'
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    mailedAlert: {
        type:String,
        default:"No"
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
    generationDate:{
        type:Date,
        required:true,
    },
    assignmentDate:{
        type:Date
    },
    engineerStatus:{
        type:String,
        required:true,
        default:"unassigned"
    },
    employeeStatus: {
        type: String,
        required: true,
        default:"unassigned"
    },
    deadlineDate: {
        type:Date,
        required:true
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
},{
    timestamps:true
})

const Order = mongoose.model('Order',orderSchema)

module.exports = Order