const express = require('express')
const router = new express.Router()
const Equipment = require('../models/equipment-model')
const Engineer = require('../models/engineer')
const Tasklist = require('../models/tasklist')
const Order = require('../models/orders')
const multer = require('multer')
const sendMessage = require('../messaging/send_email')
const sendSMS = require('../messaging/send_sms')
const sharp = require('sharp')
const bcrypt = require('bcrypt')

//hashing the password this many times with salt
const saltRounds = 8;

//functoin to update all the passwords
// async function updatePass(){
//     bcrypt.hash('sih12345', saltRounds,async function(err, hash) {
//         // Store hash in your password DB.
//         await Engineer.updateMany({},{'password':hash},(err,res)=>{
//             console.log(err,res);
//         })
//     });

// }
// updatePass()

//end point for login 
router.post('/login', async (req, res) => {
    try {
        if (req.body.email) {
            const user = await Engineer.findOne({
                emailID: req.body.email
            })
            if (user.length !== 0) {
                try {
                    const hash = user.password
                    // console.log(hash)
                    const match = await bcrypt.compare(req.body.password, hash).catch((err) => console.log('caught it'));;

                    if (match) {
                        //jwt tokens should be added here
                        res.status(200).send("logged in not really")
                    }
                } catch (e) {
                    res.status(400).send()
                }

            }
            res.status(400).send()
        }

    } catch (e) {
        res.status(400).send()
    }
})


//end point for form to be filled by suprintendent......
router.get('/order/:id', async (req, res) => {
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
router.get('/compliance/:id', async (req, res) => {
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
            status: order.status,
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
router.post('/generateorder', async (req, res) => {
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

//end-point for employee-form submission 
router.post('/submit-form', async (req, res) => {
    try {
        const body = JSON.parse(req.body)
        const engineer = await Engineer.findOne({
            engineerID: body.engineerID
        })
        console.log(engineer)
        const order = await Order.findById(body.orderId)
        order.remarks = body.additionalRemarks
        order.engineer = engineer._id
        order.status = "assigned"
        await order.save()
        engineer.orders.push(order._id)
        await engineer.save()
        const emailID = engineer.emailID
        const phoneNumber = engineer.phoneNumber
        sendMessage(emailID, 'hello', 'text-here')
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


//end-point for compliance form submission....
router.post('/submit-compliance/:id', upload.array('workImage', 20), async (req, res) => {
    try {
        //uploaded file will be saved in file attribute of request object.....
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
        await order.save()
        res.status(201).send('files uploaded')
    } catch (e) {
        res.status(415).send({
            error: 'Error uploading the file. Upload only in jpg, jpeg or png format'
        })
    }
})

//end-point for getting approval form details...
router.get('/approval-form/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        await order.populate('task').execPopulate()
        await order.populate('engineer').execPopulate()
        const tasks = order.task.tasks
        let tasklist = []
        tasks.forEach((task, i) => {
            tasklist.push({
                task: task,
                status: order.tasklist[i]
            })
        })
        console.log(tasklist)
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
            enginner: order.engineer.name
        }
        res.status(200).send(data)
    } catch (e) {
        res.status(404).send({
            error: "Could not find the requested resource!"
        })
    }
})


module.exports = router