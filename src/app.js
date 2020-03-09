const express = require('express')
const mongoose = require('mongoose')
require('./db/mongoose')
const router = require('./routers/routes')
const history = require('./routers/history-routes')
const orderGeneration = require('./utils/orderGeneration')
const bodyParser = require('body-parser')
const path = require('path')


//creates an express web-server
const app=express()

const port = process.env.PORT
//middleware function that recognizes request data as json and parses it to object(req.body)....
app.use(express.json())
app.use(express.text())
app.use(express)

//register routers on express app....
app.use(router)
app.use(history)


//function to start cycle-based order generation...
orderGeneration()


//listen on specified port.....
app.listen(port,()=>{
    console.log('Server is up on port ' + port)
})