const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    equip_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    loc_id:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
})

const Location = mongoose.model('Location',locationSchema)
module.exports = Location