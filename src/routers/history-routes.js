const express = require('express')
const router = new express.Router()
const Employee = require('../models/employee')
const Engineer = require('../models/engineer')
const Equipment = require('../models/equipment-model')
const Order = require('../models/orders')
const Location = require('../models/location')
const timespan = require('timespan')
const auth = require('../auth/auth')


//end-point for retrieving list of all orders.....
router.get('/get-orders', auth, async(req,res)=>{
    try{
        const list = await Order.find()

        for( let i=0; i<list.length; i++ ) {
            list[i].workImage = []
        }

        res.status(200).send(list)
    }
    catch(e){
        res.status(500).send('Server Error')
    }
})


//end-point for getting list of engineers to be used in dropdown list of engineers.....
router.get('/engineers', auth, async (req,res)=>{
    try{
        const list = await Engineer.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send()
    }
})


//end-point for getting list of all equipments.....
router.get('/equipment-list', auth, async(req,res)=>{
    try{
        const list = await Equipment.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send()
    }
    
})


//end-point for getting list of all employees....
router.get('/employees',auth, async(req,res) => {
    try {
        const list = await Employee.find()
        res.status(200).send(list)
    }
    catch(e) {
        res.status(404).send({error:"Could not fetch the list"})
    }
})


//end-point for getting orders according to their renewal time left...
router.get('/orders/:cycle',auth, async (req,res)=>{

    try {

        // fetch all orders which are not yet assigned...
        const orders = await Order.find({employeeStatus: 'unassigned', engineerStatus: 'unassigned'})

        // number of days within which orders whose renewal dates are coming have to be queried.....
        let daysBound = 1

        if(req.params.cycle === "daily") {
            daysBound = 1
        }
        else if(req.params.cycle === "weekly") {
            daysBound = 7
        }
        else if(req.params.cycle === "monthly") {
            daysBound = 30
        }
        else if(req.params.cycle === "six-monthly") {
            daysBound = 6*30
        }
        else{
            daysBound = 365
        }

        // upcoming-orders in a particular time-cycle....
        const upcomingOrders = orders.filter((order) => {

            const orderGenerationDate = Date.parse(order.generationDate)
            const presentDate  = Date.now()

            const cycle = order.cycle

            // cycleDays are number of days in which order will be renewed after generation.. 
            let cycleDays = 1
            
            // check if the cycle is daily, weekly or monthly and calculate number of days......
            if(cycle === "daily") {
                cycleDays = 1
            }
            else if(cycle === "weekly") {
                cycleDays = 7
            }
            else {
                cycleDays = parseInt(cycle.replace(/[^0-9\.]/g, ''), 10) * 30
            }

            // calculate duration (in days) between order generation date and presentdate..
            let totalDaysPassed = new timespan.TimeSpan(presentDate - orderGenerationDate)
            totalDaysPassed = totalDaysPassed.totalDays()

            // check if order have to completed within requested cycle ( weekly ,daily, monthly or yearly )
            if( (cycleDays >= totalDaysPassed) && (cycleDays - totalDaysPassed <= daysBound) ) {
                return true;
            }

            return false;
        })

        for( let i=0; i<upcomingOrders.length; i++ ) {
            upcomingOrders[i].workImage = []
        }

        res.status(200).send(upcomingOrders)
    }
    catch(e) {
        res.status(404).send()
    }
})


//end-point for getting list of all locations in the plant
router.get('/locations',auth, async(req,res)=>{
    try{
        const locations = await Location.find()
        res.status(200).send(locations)
    }
    catch(e){
        res.status(500).send({error:"Could not fetch locations"})
    }
})


module.exports = router