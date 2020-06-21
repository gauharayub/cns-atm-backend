const mongoose = require('mongoose')
let port = 27018
mongoose.connect('mongodb://127.0.0.1:'+port+'/master',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})
