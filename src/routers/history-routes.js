const express = require('express')
const router = new express.Router()
const Employee = require('../models/employee')
const Engineer = require('../models/engineer')
const Equipment = require('../models/equipment-model')
const Order = require('../models/orders')
const Location = require('../models/location')
const auth = require('../auth/auth')


//end-point for retrieving list of all orders.....
//inserted cors with origin as * before callback function
router.get('/get-orders',auth,async(req,res)=>{
    
    try{
        const list = await Order.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(500).send('Server Error')
    }
})

//end-point for getting list of engineers to be used in dropdown list of engineers.....
router.get('/engineers',async (req,res)=>{
    try{
        const list = await Engineer.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send()
    }
})


//end-point for getting list of all equipments.....
router.get('/equipment-list',async(req,res)=>{
    try{
        const list = await Equipment.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send()
    }
    
})

//end-point for getting list of all employees....
router.get('/employees',async(req,res)=>{
    try{
        const list = await Employee.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send({error:"Could not fetch the list"})
    }
})

//end-point for getting list of all completed or pending orders...
router.get('/orders/:completed',async (req,res)=>{
    try{
        const orders = await Order.find({
            completed:req.params.completed
        })
    }
    catch(e){
        res.status(404).send({error:"List not found"})
    }
})

//end-point for getting orders according to their cycle
router.get('/orders/:cycle',async (req,res)=>{
    try{
        if(req.params.cycle=="daily"){
            const orders = await Order.find({
                cycle:"daily"
            })
            res.status(200).send(orders)
        }
        else if(req.params.cycle=="weekly"){
            const orders = await Order.find({
                cycle:"weekly"
            })
            res.status(200).send(orders)
        }

        else{
            const orders = await Order.find({
                cycle:req.params.cycle+" month"
            })
            res.status(200).send(orders)
        }
    }
    catch(e){
        res.status(404).send()
    }
})

//end-point for getting list of all locations in the plant
router.get('/locations',async(req,res)=>{
    try{
        const locations = await Location.find()
        res.status(200).send(locations)
    }
    catch(e){
        res.status(500).send({error:"Could not fetch locations"})
    }
})

module.exports = router