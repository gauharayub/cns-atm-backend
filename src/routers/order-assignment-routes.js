const express = require('express')
const router = new express.Router()
const Engineer = require('../models/engineer')
const Order = require('../models/orders')
const TaskList = require('../models/tasklist')
const Equipment = require('../models/equipment-model')
const MaintenancePlan = require('../models/maintenance-plan')
const sendMessage = require('../messaging/send_email')
const sendSMS = require('../messaging/send_sms')
const auth = require('../auth/auth')


//end point for order-assignement form to be filled by suprintendent......
router.get('/order/:id', auth ,async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        console.log("got the order",order)
        await order.populate({
            path: 'task',
            populate: {
                path: 'maintenancePlan',
                populate: 'equipment'
            }
        }).execPopulate()
	    console.log(order)

        const date = new Date(order.deadlineDate)
        order.deadlineDate = date.getDate()

        const data = {
            tasklist: order.task.tasks,
            equipmentCode: order.equipmentCode,
            equipmentName: order.task.maintenancePlan.equipment.description,
            description: order.work,
            location: order.location,
            _id: order._id,
            cycle: order.cycle,
            deadlineDate: order.deadlineDate
        }
        res.status(200).send(data)
    } 
    catch (e) {
        res.status(404).send()
    }
})


//end-point for employee-form submission after assigning an engineer to an order... 
router.post('/submit-form',auth, async (req, res) => {
    try {
        const body = req.body
        console.log(body)
        const engineer = await Engineer.findOne({
            engineerID: body.engineerID
        })

        const order = await Order.findById(body.orderId)
        order.remarks = body.additionalRemarks
        order.engineer = engineer._id
        order.engineerStatus = "assigned"
        order.employeeStatus = "assigned"
        order.assignmentDate = Date.now()

        await order.save()
        
        engineer.orders.push(order._id)
        await engineer.save()

        const emailID = engineer.emailID
        const phoneNumber = engineer.phoneNumber
        sendMessage(emailID, 'Order Assignment', `An Order with orderID ${order._id} have been assigned to you`)
        sendSMS(phoneNumber, 'text-here')
        res.status(200).send()
    } 
    catch (e) {
        res.status(400).send({
            error: "Error parsing the body-data"
        })
    }
})


module.exports = router
