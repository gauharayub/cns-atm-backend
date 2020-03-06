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

router.get('/orders/:cycle',cors(corsOptions),(req,res)=>{
    try{
        if(req.params.cycle=="daily"){
            const orders = Order.find({
                cycle:"daily"
            })
        }
        else if(req.params.cycle="weekly"){
            const orders = Order.find({
                cycle:"weekly"
            })
        }
        else{
            const orders = 
        }
        
    }
    catch(e){

    }
})

module.exports = router