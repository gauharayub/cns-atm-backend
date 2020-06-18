const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const employeeSchema = new mongoose.Schema({
    employeeID:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
    },
    emailID:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//method to validate employee...
employeeSchema.methods.validatePassword = function(password){
    return this.password === password
}

const Employee = mongoose.model('Employee',employeeSchema)

module.exports = Employee