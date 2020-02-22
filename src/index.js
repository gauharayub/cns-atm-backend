const express = require('express')
const mongoose = require('mongoose')
const Equipment = require('./models/equipment-model')
const MaintenancePlan = require('./models/maintenance-plan')
const Location = require('./models/location')
const Tasklist = require('./models/tasklist')
const cron = require('node-cron')
const timespan = require('timespan')
require('./db/mongoose')
const routes = require('./routers/routes')
const Order = require('./models/orders')

//creates an express web-server
const app=express()

const port = process.env.PORT || 3000
app.use(express.json())

//register routers on express app....
app.use(equipmentRouter)
app.use(orderRouter)

const func = async ()=>{
    const eq1 = new Equipment({
        number:'1144',
        description:"b2-machine",
    })
    await eq1.save()
    
    const mplan = new MaintenancePlan({
        cycle:'1month',
        equip:eq1._id
    })
    await mplan.save()
    const loc1 = new Location({
        equip_id:eq1._id,
        loc_id:'H40',
        description:'240,main-plant'
    })
    await loc1.save()
    const task= new Tasklist({
        item:'internal-disc',
        workDescription:'reapiring of internal-disc',
        maintenancePlan:mplan._id
    })
    task.save()
    const user = await Equipment.findById(eq1._id)
    user.maintenancePlanList.push(new mongoose.Types.ObjectId(mplan._id))
    user.locations.push(loc1._id)
    const mp1 = await MaintenancePlan.findById(mplan._id)
    mp1.tasks.push(task._id)
    await mp1.save()
    await user.save()
    await user.populate('maintenancePlanList').execPopulate()
    await mp1.populate('tasks').execPopulate()
    await user.populate('locations').execPopulate()
    console.log(mp1)
    console.log(user)
}


//function to generate orders every cycle of task.
const orderGeneration = ()=>{
//runs every second
    cron.schedule('*/1 * * * * *',async ()=>{
        const tasks  = await Tasklist.find()
        for(let i=0;i<tasks.length;i++){
            let current = Date.now()
            let updated = Date.parse(tasks[i].updatedAt)

//calculate time-diifference between current time and last update time....          
            let tspan = new timespan.TimeSpan(current-updated)
            await tasks[i].populate('maintenancePlan').execPopulate()
            let months = tasks[i].maintenancePlan.cycle
            month= parseInt(months.replace(/[^0-9\.]/g, ''), 10)
            console.log(month)
            let days = 1;
            let id = tasks[i]._id
            
//check if cycle is reached or not.....            
            if(tspan.totalDays()>=days){

//create new order if cycle has completed for task....         
                const order = new Order({
                    number:100,
                    equip_id:tasks[i].maintenancePlan.equip,
                    item:tasks[i].item,
                    work:'Cleaning of metal-part',
                    task_id:id
                })
                await order.save()
                tasks[i].updatedAt = current
                await tasks[i].save()
                console.log(order)
            }
        }
    })
}

// func()
orderGeneration()


//listen on specified port.....
app.listen(port,()=>{
    console.log('Server is up on port ' + port)
})