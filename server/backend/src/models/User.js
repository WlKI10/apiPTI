const {Schema, model} = require('mongoose');
var bcrypt = require('bcrypt');
    SALT_WORK_FACTOR = 10;

 const userSchema = new Schema({
     email: {type: String, required: true, unique: true},
     username: {type: String, required: true, unique: true},
     password: {type: String, required: true},
     raspy:[{UUID:{type:String,required:false, unique:true},PIN:{type:String,required:false,unique:false}}]
 }, {
     timestamps: true
 });

 userSchema.pre('save', function(next){
    var user = this;

    //Only hash the password if it has been modified or is new
    if (!user.isModified('password')) return next();

    //Generate a Salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
        if (err) return next(err);

        //Hash the password using the new salt
        bcrypt.hash(user.password, salt, function(err, hash){
            if (err) return next(err);

            //Overwrite the password with the hashed one
            user.password = hash;
            next();
        });
    });
 });

 userSchema.methods.comparePassword = function (candidatePassword, callback){
     bcrypt.compare(candidatePassword, this.password, function(err,isMatch){
         if (err) return callback(err);
         callback(undefined, isMatch);
     });
 };
 

 module.exports = model('User', userSchema);
