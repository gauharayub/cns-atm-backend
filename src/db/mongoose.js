const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}
