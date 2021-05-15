const {Schema,model} = require('mongoose')
var bcrypt = require('bcrypt');
    SALT_WORK_FACTOR = 10;

/*const raspberry = new Schema({
    reference:{
        type:String,required:true, unique:true
    },
    pin:{
        type:String, required:true,unique:false

    }
});*/
const raspiSchema = new Schema ({
username:{type:String,required:true,unique:true},
raspis:[{reference:String,pin:String}]

});
raspiSchema.pre('save',function(next){
    var Raspi = this
    if (!Raspi.isModified('raspis')) return next();

    //Generate a Salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
        if (err) return next(err);

        //Hash the pin using the new salt
        bcrypt.hash(Raspi.raspis.findOne('pin'), salt, function(err, hash){
            if (err) return next(err);

            //Overwrite the pin with the hashed one
            Raspi.raspis.push(hash);
            next();
        });
    });



})
module.exports=model('Raspi',raspiSchema);
