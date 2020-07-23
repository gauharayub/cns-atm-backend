const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://gak:atlas12345@technocluster.clgff.mongodb.net/ATM-Database', {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})
