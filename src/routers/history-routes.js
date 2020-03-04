const express = require('express')
const router = new express.Router()
const Employee = require('../models/employee')

router.get('/employees',async(req,res)=>{
    try{
        const list = await Employee.find()
        res.status(200).send(list)
    }
    catch(e){
        res.status(404).send({"error":"List not found"})
    }
})

module.exports = router