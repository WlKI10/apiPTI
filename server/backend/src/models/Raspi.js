const {Schema, model} = require('mongoose');
var bcrypt = require('bcrypt');
    SALT_WORK_FACTOR = 10;

const raspiSchema = new Schema ({
    serial_number:{type:String,required:true, unique:true},
    username:{type:String,required:true,unique:false},
});



module.exports=model('Raspi',raspiSchema);
