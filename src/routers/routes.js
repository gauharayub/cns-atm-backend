const express = require('express')
const router = new express.Router()
const Equipment = require('../models/equipment-model')
const Engineer = require('../models/engineer')
const Employee = require('../models/employee')
const Tasklist = require('../models/tasklist')
const Order = require('../models/orders')
const multer = require('multer')
const sendMessage = require('../messaging/send_email')
const sendSMS = require('../messaging/send_sms')
const sharp = require('sharp')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../auth/auth')

/* use the commented code below only for testing */

//hashing the password this many times with salt
// const saltRounds = 8;

// // function to update all the passwords
// async function updatePass(){
//     bcrypt.hash('sih12345', saltRounds,async function(err, hash) {
//         // Store hash in your password DB.
//         await Employee.updateMany({},{'password':hash},(err,res)=>{
//             console.log(err,res);
//         })
//     });

// }
// updatePass()


// end point to not allow logged in user to login page
router.post('/verify', (req, res) => {
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


//end point for form to be filled by suprintendent......
router.get('/order/:id', auth ,async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        await order.populate({
            path: 'task',
            populate: {
                path: 'maintenancePlan',
                populate: 'equipment'
            }
        }).execPopulate()

        console.log(order)
        const data = {
            tasklist: order.task.tasks,
            assignmentNumber: order.number,
            equipmentCode: order.task.maintenancePlan.equipment.equipmentCode,
            equipmentName: order.task.maintenancePlan.equipment.description,
            description: order.work,
            location: order.location,
            _id: order._id,
            cycle: order.cycle
        }
        res.status(200).send(data)
    } catch (e) {
        res.status(404).send()
    }
})

//end-point for form to be filled by engineer after completion of his assignment....
router.get('/compliance/:id',auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        await order.populate({
            path: 'task',
            populate: {
                path: 'maintenancePlan',
                populate: 'equipment'
            }
        }).execPopulate()
        console.log(order)
        const data = {
            tasklist: order.task.tasks,
            assignmentNumber: order.number,
            equipmentCode: order.task.maintenancePlan.equipment.equipmentCode,
            equipmentName: order.task.maintenancePlan.equipment.description,
            description: order.work,
            location: order.location,
            _id: order._id,
            cycle: order.cycle
        }
        res.status(200).send(data)
    } catch (e) {
        res.status(404).send({
            error: 'Could not find the requested resource'
        })
    }
})


//end-point for custom-generation of an assignment....
router.post('/generateorder',auth, async (req, res) => {
    try {
        const order = new Order(req.body)
        await order.save()
        res.status(201).send('Order generated successfully')
    } catch (e) {
        res.status(500).send({
            error: 'Error generating the object'
        })
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
        order.engineerStatus = "todo"
        order.employeeStatus = "todo"

        await order.save()
        
        engineer.orders.push(order._id)
        await engineer.save()

        const emailID = engineer.emailID
        const phoneNumber = engineer.phoneNumber
        sendMessage(emailID, 'Order Assignment', `An Order with orderID ${order._id} have been assigned to you`)
        sendSMS(phoneNumber, 'text-here')
        res.status(200).send()
    } catch (e) {
        res.status(400).send({
            error: "Error parsing the body-data"
        })
    }
})



//object for upload customization.....
const upload = multer({
    limits: {
        fileSize: 10000000 //file-size in bytes.....
    },
    //to allow only particular files to be uploaded ......    
    fileFilter(req, file, cb) {

        //match function accepts a regular expression(regex) to match with the filename......        
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload jpeg,jpg or png files'))
        }
        // call the callback to stop filter function with true as a sign that correct file is uploaded.
        cb(undefined, true)
    }
})


// end-point for compliance form submission....
router.post('/submit-compliance/:id',auth, upload.array('workImage', 20), async (req, res) => {
    try {

        // uploaded file will be saved in file attribute of request object.....
        // const file =  await sharp(req.file.buffer).resize({ width:500, height: 300}).png().toBuffer()
        const order = await Order.findById(req.params.id)
        const tasklist = JSON.parse(req.body.taskListValue)
        const comments = JSON.parse(req.body.comments)

        console.log(req.head)
        console.log(req.files)
        order.tasklist = tasklist
        order.comments = comments
        const files = req.files.map((file) => {
            return file.buffer
        })
        
        order.workImage = files
        order.engineerStatus = "review"
        order.employeeStatus = "review"

        await order.save()
        res.status(201).send('files uploaded')

    } catch (e) {
        res.status(415).send({
            error: 'Error uploading the file. Upload only in jpg, jpeg or png format'
        })
    }
})


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
            status: order.status,
            location: order.location,
            equipmentCode: order.equipmentCode,
            cycle: order.cycle,
            assignmentCode: order.assignmentCode,
            assignmentNumber: order.assignmentNumber,
            engineer
        }

        res.status(200).send(data)

    } catch (e) {

        res.status(404).send({
            error: "Could not find the requested resource!"
        })
    }
})


router.get('/engineerOrders', auth, async(req, res) => {
    
    try {
        const engineer = req.user

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
        
        res.send({ orders })
    }
    catch (e) {
        res.status(404).send({ error:  e.message })
    }
    
})

router.get('/employeeOrders', auth, async (req, res) => {
    try {
        const employee = req.user

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
        
        res.send({ orders })

    }
    catch (e) {
        res.status(404).send({error :  e.message })
    }
    
})

router.post('/submit-approval/:id', auth, async (req, res) => {
    
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId)

        if (req.body.undoneTasks.length) {

            //order details of newly generated order out of undone tasks..
            orderdetails = {
                equipmentCode: order.equipmentCode,
                assignmentCode: order.aassignmentCode,
                equipment: order.equipment,
                number: order.number + 'B',
                work: order.work,
                location: order.location,
                cycle: order.cycle,
                tasklist: req.body.undoneTasks
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
        res.status(400).send({error: e.message})
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
        res.status(400).send({error: e.message})
    }
    
})

module.exports = router