const {Schema, model} = require('mongoose');
var bcrypt = require('bcrypt');
    SALT_WORK_FACTOR = 10;

const raspiSchema = new Schema ({
    serial_number:{type:String,required:true, unique:true},
    username:{type:String,required:true,unique:false},
    button1:{type:String, required:false},
    button2:{type:String, required:false},
    button3:{type:String, required:false},
    button1_goal:{type:String, required:false},
    button2_goal:{type:String, required:false},
    button3_goal:{type:String, required:false}
});



module.exports=model('Raspi',raspiSchema);
