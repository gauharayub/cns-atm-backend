const mongoose = require('mongoose')

const engineerSchema  = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    engineerID:{
        type:String,
        unique:true,
        required:true
    },
    emailID:{
        type:String,
        required:true,
        unique:true
    },
    department:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    orders:[{type:mongoose.Schema.Types.ObjectId, ref:'Order'}]
})

const Engineer = mongoose.model('Engineer',engineerSchema)

module.exports = Engineer