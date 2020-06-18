const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

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
    password:{
        type:String,
        required:true
    },
    orders:[{type:mongoose.Schema.Types.ObjectId, ref:'Order'}]
})

//method to validate engineer..
engineerSchema.methods.validatePassword = function(password){
    return this.password === password
}

const Engineer = mongoose.model('Engineer',engineerSchema)

module.exports = Engineer