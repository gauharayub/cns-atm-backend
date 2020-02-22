const express = require('express')
const router = new express.Router()
const Equipment = require('../models/equipment-model')
const Tasklist = require('../models/tasklist')
const Order = require('../models/orders')


//end-point for retrieving list of all orders.....
router.get('/get-orders',async(req,res)=>{
    try{
        const list = await Order.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(500).send('Server Error')
    }
})


//end-point for adding remarks after completion of order.....
router.patch('/updateorder/:id',async(req,res)=>{
    try{
        const order = await Order.findById(req.params.id)
        order.remarks = req.body.remarks
        order.completed = req.body.completed
        await order.save()
        res.send(order)
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

//end point for form to be filled by suprintendent......
router.get('/order/:id',async (req,res)=>{
    try{
        const order = await Order.findById(req.params.id)
        await order.populate('task')
                   .populate('task.maintenancePlan')
                   .populate('task.maintenancePlan.equip')
        console.log(order)
        const data = {
            assignmentNumber:order.number,
            equipmentCode:order.task.maintenancePlan.equip.equipmentCode,
            equipmentName:order.task.maintenancePlan.equip.description,
            description:order.work
        }
        res.status(200).send(data)
    }
    catch(e){
        res.status(404).send()
    }
})

//end-point for form to be filled by engineer after completion of his assignment....
router.get('/compliance/:id',async(req,res)=>{
    try{
        const order = await Order.findById(req.params.id)
        await order.populate('task')
                   .populate('task.maintenancePlan')
                   .populate('task.maintenancePlan.equip')
        console.log(order)
        const data = {
            tasklist:order.task.tasks,
            assignmentNumber:order.number,
            equipmentCode:order.task.maintenancePlan.equip.equipmentCode,
            equipmentName:order.task.maintenancePlan.equip.description,
            description:order.work,
            status:order.status,
        }
        res.status(200).send(data)
    }
    catch(e){
        res.status(404).send()
    }
})


//end-point for custom-generation of an assignment....
router.post('/generateorder',async(req,res)=>{
    try{
        const order  = new Order(req.body)
        await order.save()
        res.status(201).send('Order generated successfully')
    }
    catch(e){
        res.status(500).send('Error generating the object')
    }
   

})

//end-point for photo/document uploads..
router.post('/uploadphoto',async (req,res)=>{
    
})


module.exports = router