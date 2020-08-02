const express = require('express')
const router = new express.Router()
const TaskList = require('../models/tasklist')
const Engineer = require('../models/engineer')
const Order = require('../models/orders')
const auth = require('../auth/auth')


// end-point for getting approval form details...
router.get('/approval-form/:id',auth, async (req, res) => {
    try {

        const order = await Order.findById(req.params.id)
        await order.populate('task').execPopulate()
        await order.populate('engineer').execPopulate()
        
        const tasks = order.task.tasks

        //tasks to be perfomed by engineer
        let tasklist = []
        tasks.forEach((task, i) => {
            tasklist.push({
                task: task,
                status: order.tasklist[i]
            })
        })
        
        // only for testing purpose so that app doesn't crash...
        let engineer = "test"

        // actual code to be replaced with test code...
        // const engineer = order.engineer.name

        const data = {
            tasklist,
            remarks: order.remarks,
            description: order.work,
            images: order.workImage,
            location: order.location,
            equipmentCode: order.equipmentCode,
            cycle: order.cycle,
            number: order.number,
            engineer,
            deadlineDate: order.deadlineDate,
            assignmentDate: order.assignmentDate,
            generationDate: order.generationDate
        }

        res.status(200).send(data)

    } 
    catch (e) {

        res.status(404).send({
            error: "Could not find the requested resource!"
        })
    }
})


// submit approval-form end-point..
router.post('/submit-approval/:id', auth, async (req, res) => {
    
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId)

        let date = new Date(order.generationDate)
        order.generationDate = date.getDate()

        date = new Date(order.deadlineDate)
        order.deadlineDate = date.getDate()


        if (req.body.undoneTasks && req.body.undoneTasks.length) {
            //order details of newly generated order out of undone tasks..
            orderdetails = {
                equipmentCode: order.equipmentCode,
                equipment: order.equipment,
                number: order.number + '-B',
                work: order.work,
                location: order.location,
                cycle: order.cycle,
                tasklist: req.body.undoneTasks,
                task:order.task,
                generationDate: Date.now(),
                deadlineDate:Date.now()
            }

            // generate new order for remaining tasks
            const newOrder = new Order(orderdetails)
            await newOrder.save()
        }

        // change status of this order for employee as well as engineer..
        order.engineerStatus = "completed"
        order.employeeStatus = "completed"
        
        await order.save()
        res.status(200).send()
    }
    catch (e) {
        res.status(400).send({error: "Form could not be submitted"})
    }
    
})


module.exports = router