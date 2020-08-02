const express = require('express')
const router = new express.Router()
const Engineer = require('../models/engineer')
const Employee = require('../models/employee')
const Order = require('../models/orders')
const Location = require('../models/location')
const jwt = require('jsonwebtoken')
const auth = require('../auth/auth')
const Equipment = require('../models/equipment-model')
  

// end point to not allow logged in user to login page
router.post('/verify',auth, async (req, res) => {
    try {
        // respond with 200 if jwt of user 
        const token = req.get('authorization')
        const ans = jwt.verify(token, process.env.JWT_SECRET)
        if(ans){
            res.status(200).send()
        }
        else{
            res.status(204).send()
        }
    } catch (e) {
        res.status(403).send("not logged in")
    }
})


// end point for login which is common for engineer and employee 
router.post('/login', async (req, res) => {
    try {
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

                const doesMatch = await user.validatePassword(req.body.password)

                // validate password of user....
                if (doesMatch === true) {
                    // if user is validated then generate jwt token which will be stored in user's browser....
                    const token = await user.generateJWT()
                    res.status(200).send({user,token})
                }
            }
            catch (e) {
                res.status(400).send({typeofUser: req.user })
            }
        }
    } 
    catch(e){
        res.status(401).send('Failed to login')
    }    
})

// get type of user...
router.get('/typeofuser', auth, async (req,res) => {
    try{
        res.status(200).send({typeofUser: req.type})
    }
    catch(e){
        res.status(404).send('Failed to get type of user')
    }
})


router.post('/logout', auth, async (req,res) => {
    try{
        const user = req.user

        // remove current token from which user has been authenticated....
        const tokens = user.tokens.filter((token)=>{
            return token != req.token
        })
        user.tokens = tokens

        await user.save()
        res.status(200).send()
    }
    catch(e) {
        res.status(401).send('Failed to logout')
    }
})


// end-point to fetch orders of engineer...
router.get('/engineerOrders', auth, async(req, res) => {
    
    try {
        const engineer = req.user
        await engineer.populate('orders').execPopulate()
        
         // array of orders assigned to engineer..
        const ordersAssignedToEngineer = engineer.orders

        for( let i=0; i<ordersAssignedToEngineer.length; i++ ) {
            ordersAssignedToEngineer[i].workImage = []
        }

        const assignedOrders = {
            heading: 'Assigned',
            orders: ordersAssignedToEngineer.filter((order) => order.engineerStatus === "assigned")
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
        orders.push(assignedOrders)
        orders.push(progressOrders)
        orders.push(reviewOrders)
        orders.push(completedOrders)
        orders.push(engineer)
        res.send(orders)
    }
    catch (e) {
        res.status(404).send({ error:  "Could not query orders" })
    }
    
})


// end-point to fetch orders of employee...
router.get('/employeeOrders', auth, async (req, res) => {
    try {
        const employee = req.user

        await employee.populate('orders').execPopulate()

        // orders assigned by employee..
        const ordersAssignedByEmployee = employee.orders
        const unassignedOrders = await Order.find({employeeStatus: 'unassigned', engineerStatus: 'unassigned'})

        for( let i=0; i<ordersAssignedByEmployee.length; i++ ) {
            ordersAssignedByEmployee[i].workImage = []
        }

        const todoOrders = {
            heading: 'Todo',
            orders: unassignedOrders
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
        orders.push(assignedOrders)
        orders.push(progressOrders)
        orders.push(reviewOrders)
        orders.push(completedOrders)
        res.send(orders)
    }
    catch (e) {
        res.status(404).send({error : "Could not found resources" })
    }
    
})


// move the order to progress-card...
router.patch('/toprogress/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
	if(order){
	console.log("order found")}
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
router.post('/searchorders', auth , async (req,res) => {
    try {

        // object for filter options...
        const filterOptions = {}

        //add createdAt date filter if date query is present
        if (req.body.date != "All" && req.body.date) {
            const date = new Date(req.body.date)
            filterOptions.createdAt = date
        }

        // add completed filter if completed query is present..
        if (req.body.completed === "Completed") {
            const completed = "Yes"
            filterOptions.completed = completed
        }
        else if (req.body.completed === "Pending") {
            const completed = "No"
            filterOptions.completed = completed
        }

        
        // add locationId filter if location query is present..
        if (req.body.location != "All" && req.body.location) {
            filterOptions.location = req.body.location
        }

        // add equipmentId filter if equipment query is present.. 
        if (req.body.equipment != "All" && req.body.equipment) {
            filterOptions.equipmentCode = req.body.equipment
        }

        // add find by equipment name filter
        if (req.body.equipmentName != "All" && req.body.equipmentName) {
            const equipment  = await Equipment.findOne({ name: req.body.equipmentName })
            filterOptions.equipment = equipment._id
        }

        // add find by location name filter
        if (req.body.locationName != "All" && req.body.locationName) {
            const location = await Location.findOne({ name: req.body.locationName })
            filterOptions.location = location.description
        }
        
        // find all orders after applying filter options..
        const orders = await Order.find(filterOptions)

        for( let i=0; i<orders.length; i++ ) {
            orders[i].workImage = []
        }

        res.status(200).send(orders)
    }   
    catch (e) {
        res.status(404).send({error: "Could not query orders"})
    }
})


router.post('/sethealth', auth, async (req,res) => {
    try{
        const equipment = await Equipment.findById(req.body.equipmentId)
        const voltage = req.body.voltage
        const current = req.body.current
        const temperature = req.body.temperature
        if(voltage!=equipment.voltage && current!=equipment.current && temperature!=equipment.temperature) {
            equipment.stateOfEquipment = "Scrap"
        }
        else if((voltage!=equipment.voltage && current!=equipment.current) || 
                (voltage!=equipment.voltage && temperature!=equipment.temperature) || 
                (current != equipment.current && temperature!=equipment.temperature)) {
            equipment.stateOfEquipment = "Poor"     
        }
        else if(voltage!=equipment.voltage || current!=equipment.current || temperature!=equipment.temperature) {
            equipment.stateOfEquipment = "Fair"
        }
        else{
            equipment.stateOfEquipment = "Healthy"
        }

        await equipment.save()
        res.status(200).send()
    }
    catch(e){
        res.status(401).send()
    }
})


module.exports = router