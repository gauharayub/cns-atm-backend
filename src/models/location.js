const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    equipments:[{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Equipment'
    }],

    locationId:{
        type: String,
        required: true
    },

    description:{
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    }
})


const Location = mongoose.model('Location',locationSchema)
module.exports = Location