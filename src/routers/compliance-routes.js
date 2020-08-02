const express = require('express')
const router = new express.Router()
const Order = require('../models/orders')
const TaskList = require('../models/tasklist')
const Equipment = require('../models/equipment-model')
const MaintenancePlan = require('../models/maintenance-plan')
const multer = require('multer')
const auth = require('../auth/auth')


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
            equipmentCode: order.task.maintenancePlan.equipment.equipmentCode,
            equipmentName: order.task.maintenancePlan.equipment.description,
            description: order.work,
            location: order.location,
            number: order.number,
            _id: order._id,
            cycle: order.cycle,
            deadlineDate: order.deadlineDate,
            assignmentDate: order.assignmentDate,
            generationDate: order.generationDate
        }
        res.status(200).send(data)
    } 
    catch (e) {
        res.status(404).send({
            error: 'Could not find the requested resource'
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

    } 
    catch (e) {
        res.status(415).send({
            error: 'Error uploading the file. Upload only in jpg, jpeg or png format'
        })
    }
})


module.exports = router