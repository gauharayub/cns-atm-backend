const express = require('express')
require('./db/mongoose')
const mainRoutes = require('./routers/main-routes')
const historyRoutes = require('./routers/history-routes')
const complianceRoutes = require('./routers/compliance-routes')
const approvalRoutes = require('./routers/approval-routes')
const orderAssignmentRoutes = require('./routers/order-assignment-routes')
const orderGeneration = require('./utils/orderGeneration')
const path = require('path')
const cors = require('cors')

//creates an express web-server
const app=express()

//entertain all requests from any origin...
app.use(cors())

const port = process.env.PORT

//request parsers for text and json data..
app.use(express.json())
app.use(express.text())

//directory for serving static files...
app.use(express.static(path.join(__dirname,'../public')))

//register routers on express app....
app.use(mainRoutes)
app.use(historyRoutes)
app.use(complianceRoutes)
app.use(approvalRoutes)
app.use(orderAssignmentRoutes)

//function to start cycle-based order generation...
orderGeneration()


//listen on specified port.....
app.listen(port,()=>{
    console.log('Server is up on port ' + port)
})