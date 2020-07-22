const express = require('express')
const router = new express.Router()
const Equipment = require('../models/equipment-model')
const Engineer = require('../models/engineer')
const Employee = require('../models/employee')
const Tasklist = require('../models/tasklist')
const Order = require('../models/orders')
const sendMessage = require('../messaging/send_email')
const sendSMS = require('../messaging/send_sms')
const jwt = require('jsonwebtoken')
const auth = require('../auth/auth')


// end point to not allow logged in user to login page
router.post('/verify', async (req, res) => {
    try {
        // respond with 200 if jwt of user 
        const token = req.get('authorization')
        const ans = jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).send()
    } catch (e) {
        res.status(403).send("not logged in")
    }
})

// end point for login which is common for engineer and employee 
router.post('/login', async (req, res) => {

    // find user in engineer..
    const engineer = await Engineer.findOne({
        emailID: req.body.email
    })
    
    // find user in employee..
    const employee = await Employee.findOne({
        emailID: req.body.email
    })

    if (employee || engineer) {
        try {

            let user = employee
            // if user is not employee then update user to engineer..
            if (engineer) {
                user = engineer
            }
            // validate password of user....
            if (user.validatePassword(req.body.password)) {
                // if user is validated then generate jwt token which will be stored in user's browser....
                const token = await user.generateJWT()
                res.status(200).send({user,token})
            }
        } catch (e) {
            res.status(400).send()
        }
    } 

    res.status(401).send()
})


router.get('/engineerOrders', auth, async(req, res) => {
    
    try {
        const engineer = req.user

       
        await engineer.populate('orders').execPopulate()
        
         // array of orders assigned to engineer..
        const ordersAssignedToEngineer = engineer.orders

        const todoOrders = {
            heading: 'Todo',
            orders: ordersAssignedToEngineer.filter((order) => order.engineerStatus === "todo")
        }

        const progressOrders = {
            heading: 'Progress',
            orders: ordersAssignedToEngineer.filter((order) => order.engineerStatus === "progress")
        }

        const reviewOrders = {
            heading: 'Review',
            orders: ordersAssignedToEngineer.filter((order) => order.engineerStatus === "review")
        } 

        const completedOrders = {
            heading: 'Completed',
            orders: ordersAssignedToEngineer.filter((order) => order.engineerStatus === "completed")
        }
        const orders = []
        orders.push(todoOrders)
        orders.push(progressOrders)
        orders.push(reviewOrders)
        orders.push(completedOrders)
        
        res.send(orders )
    }
    catch (e) {
        res.status(404).send({ error:  "Could not query orders" })
    }
    
})

router.get('/employeeOrders', auth, async (req, res) => {
    try {
        const employee = req.user

        await employee.populate('orders').execPopulate()

        // orders assigned by employee..
        const ordersAssignedByEmployee = employee.orders

        const todoOrders = {
            heading: 'Todo',
            orders: ordersAssignedByEmployee.filter((order) => order.employeeStatus === "todo")
        }

        const progressOrders = {
            heading: 'Progress',
            orders: ordersAssignedByEmployee.filter((order) => order.employeeStatus === "progress")
        }

        const assignedOrders = {
            heading: 'Assigned',
            orders: ordersAssignedByEmployee.filter((order) => order.employeeStatus === "assigned")
        }

        const reviewOrders = {
            heading: 'Review',
            orders: ordersAssignedByEmployee.filter((order) => order.employeeStatus === "review")
        } 

        const completedOrders = {
            heading: 'Completed',
            orders: ordersAssignedByEmployee.filter((order) => order.employeeStatus === "completed")
        }
        const orders = []
        orders.push(todoOrders)
        orders.push(progressOrders)
        orders.push(assignedOrders)
        orders.push(reviewOrders)
        orders.push(completedOrders)
        
        res.send(orders )

    }
    catch (e) {
        res.status(404).send({error : "Could not found resources" })
    }
    
})


// move the order to progress-card...
router.patch('/toprogress/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        // change status of order for engineer and employee...
        order.employeeStatus = "progress"
        order.engineerStatus = "progress"

        await order.save()
        res.status(200).send()
    }
    catch (e) {
        res.status(400).send({error: "Failed to update status"})
    }
    
})

// multiple query filters for fetching orders...
// /getorders?completed=true&locationId=111&date=&equipmentId=kk
router.get('/searchorders', auth, async (req,res) => {
    try {

        // object for filter options...
        const filterOptions = {}
        

        // add createdAt date filter if date query is present
        if (req.query.date != "All" && req.query.date) {
            filterOptions.createdAt = req.query.date
        }

        // add completed filter if completed query is present..
        if (req.query.completed === "Completed") {
            const completed = "Yes"
            filterOptions.completed = completed
        }
        else if (req.query.completed === "Pending") {
            const completed = "No"
            filterOptions.completed = completed
        }

        
        // add location filter if location query is present..
        if (req.query.location != "All" && req.query.location) {
            filterOptions.location = req.query.location
        }

        // add equipment filter if equipment query is present.. 
        if (req.query.equipment != "All" && req.query.equipment) {
            filterOptions.equipmentCode = req.query.equipment
        }

        
        // find all orders after applying filter options..
        const orders = await Order.find(filterOptions)

        res.status(200).send({ orders })
    }   
    catch (e) {
        res.status(404).send({error: "Could not query orders"})
    }
})


module.exports = router