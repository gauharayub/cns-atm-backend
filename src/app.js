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
//request parsers for text and json data..
app.use(express.json())
app.use(express.text())
app.use(express.static(path.join(__dirname,'../public')))

//register routers on express app....
app.use(router)
app.use(history)


//function to start cycle-based order generation...
orderGeneration()


//listen on specified port.....
app.listen(port,()=>{
    console.log('Server is up on port ' + port)
})