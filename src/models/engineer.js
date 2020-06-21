const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
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


//method to validate engineer, don't use arrow functions as they prevent explicit binding of this..
engineerSchema.methods.validatePassword = async function(password){

    const hash = this.password
    const match = await bcrypt.compare(password, hash).catch((err) => console.log('caught it'))
    return match
    
}


//method to generate JWT if the user has been verified, this jwt will be stored in local storage....
engineerSchema.methods.generateJWT = function(){
    
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    return token

}

engineerSchema.methods.toJSON  = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    return userObject
}

const Engineer = mongoose.model('Engineer',engineerSchema)

module.exports = Engineer