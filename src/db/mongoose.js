const mongoose = require('mongoose')


mongoose.connect('mongodb://127.0.0.1:27018/master',{

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {

    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})
