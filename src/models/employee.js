const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
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
    },
    department: {
        type: String,
    },
    orders: [{type:mongoose.Schema.Types.ObjectId, ref: 'Order'}],
    tokens:[{type:String, required:true}]
})

//method to validate employee...
employeeSchema.methods.validatePassword = async function(password){
    
    const hash = this.password
    const match = await bcrypt.compare(password, hash).catch((err) => console.log('caught it'))
    return match

}

employeeSchema.methods.generateJWT = async function(){

    const user = this
    const token  = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens.push(token)
    await user.save()
    return token

}

employeeSchema.methods.toJSON  = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    return userObject
}

const Employee = mongoose.model('Employee',employeeSchema)

module.exports = Employee