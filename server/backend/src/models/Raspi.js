const {Schema,model} = require('mongoose')
const raspiSchema = new Schema ({
username:{type:String,required:true,unique:true},
raspis:[String]

});
raspiSchema.pre('save',function(next){
    var Raspi = this


})
module.exports=model('Raspi',raspiSchema);
