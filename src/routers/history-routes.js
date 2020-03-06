const express = require('express')
const router = new express.Router()
const Employee = require('../models/employee')
const Order = require('../models/orders')
const cors = require('cors')

//entertain every request
const corsOptions = {
    origin: '*'
}

//end-point for getting list of all equipments.....
router.get('/equipment-list',cors(corsOptions),async(req,res)=>{
    try{
        const list = await Equipment.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send()
    }
    
})

//end-point for getting list of all employees of Airport Authority of India....
router.get('/employees',cors(corsOptions),async(req,res)=>{
    try{
        const list = await Employee.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send({error:"List not found"})
    }
})

//end-point for getting list of all completed orders...
router.get('/completed-orders',cors(corsOptions),async (req,res)=>{
    try{
        const orders = await Order.find({
            completed:"Yes"
        })
    }
    catch(e){
        res.status(404).send({error:"List not found"})
    }
})

//end-point for getting orders according to their cycle
router.get('/orders/:cycle',cors(corsOptions),async (req,res)=>{
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

module.exports = router