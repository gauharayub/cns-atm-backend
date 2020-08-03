const Location = require('../models/location')
const Equipment = require('../models/equipment-model')
const MaintenancePlan = require('../models/maintenance-plan')
const Order = require('../models/orders')
const cron = require('node-cron')
const timespan = require('timespan')
const sendMessage = require('../messaging/send_email')
const sendSMS = require('../messaging/send_sms')
const sendWhatsappMessage = require('../messaging/whatappClient')

//count of order number
var num = 2231

//function to generate orders every cycle of task.
const orderGeneration = async()=>{

    //runs every 10 second
    cron.schedule('*/50 * * * * *', async ()=>{
        // fetch list of all equipments...
        const equipments = await Equipment.find()

        for(let i=0; i<equipments.length; i++) {
            await equipments[i].populate('maintenancePlanList').execPopulate()
            await equipments[i].populate('location').execPopulate()
            const maintenanceList = equipments[i].maintenancePlanList
        
            for(let j=0; j<maintenanceList.length; j++) {
                let current = Date.now()
                let updated = Date.parse(maintenanceList[j].updatedAt)

                //calculate time-diifference between current time and last update time....
                let tspan = new timespan.TimeSpan(current-updated)

                //parse months from cycle string.....
                let cycle = maintenanceList[j].cycle
                let days = 1

                // check if the cycle is daily, weekly or monthly......
                if(cycle=="daily"){
                    days = 1
                }
                else if(cycle=="weekly"){
                    days = 7
                }
                else{
                    month= parseInt(cycle.replace(/[^0-9\.]/g, ''), 10)
                    days  = month*30
                }

                //check if cycle is reached or not.....         
                if(tspan.totalDays()>=days){

                    //create new order if cycle has completed for task....  
                    const order = new Order({
                        number:num,
                        equipment:maintenanceList[j].equipment,
                        equipmentCode:equipments[i].equipmentCode,
                        work:maintenanceList[j].task,
                        task:maintenanceList[j].task,
                        location:equipments[i].location.description,
                        generationDate: Date.now(),
                        cycle:maintenanceList[j].cycle,
                    })

                    num++
                    await order.save()
                    maintenanceList[j].updatedAt = current
                    await maintenanceList[j].save()
                    console.log('order generated')
                }
            }
        }
    })

    // cron scheduler for detecting deadline of equipments...
    cron.schedule('* */50 * * * *', async () => {
        const orders = await Order.find()

        for(let i=0; i<orders.length; i++) {
            const currentDate = Date.now()
            const deadline = Date.parse(orders[i].deadlineDate)
            let tspan = new timespan.TimeSpan(deadline - currentDate)
            console.log(tspan.totalDays())
            if(tspan.totalDays() < 0 && orders[i].mailedAlert=="No" && orders[i].engineerStatus!="completed"){
                sendMessage('anasbeg50@gmail.com', 'One day left for maintenance work to be completed',
                            'Please get the maintenance work completed. Only one day to go before deadline')
                sendSMS('+919835555474', 'Please get the maintenance work completed. Only one day to go before deadline')
                sendWhatsappMessage('+919835555474', 'Please get the maintenance work completed. Only one day to go before deadline')
                orders[i].mailedAlert = "Yes"
                await orders[i].save()
            }
        }
    })
}


module.exports = orderGeneration