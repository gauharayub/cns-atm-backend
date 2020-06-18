const passport= require('passport')
const session =  require('express-session')
const LocalStrategy = require('passport-local')

const Engineer = require('../models/engineer')
const Employee = require('../models/employee')

passport.use(new LocalStrategy({

},
async (email,password,done)=>{

    const engineer = Engineer.findOne({emailID:email})
    const employee = Employee.findOne({emailID:email})



}))






