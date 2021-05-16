const {Router} = require('express');
const router = Router();
const Raspi = require('../models/Raspi');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const saltRounds = 10;
var raspis_to_add = new Map();


router.post('/signup', async (req,res) => {
    const {email, username, password} = req.body;

    //Comprobar que no haya repeticiones en la DB
    var user = await User.findOne({email})
    if (user) return res.status(401).send("The email is already in use");
    user = await User.findOne({username})
    if (user) return res.status(401).send("The username is already in use");
    const aux = email.split('@');
    if (aux.length != 2) return res.status(401).send("The email is not valid");

    const newUser = new User({email, username, password});
    await newUser.save();

    //Creamos el token
    const token = jwt.sign({_id: newUser._id,username: newUser.email}, 'secretKey')
    //res.status(200).json({token})

    res.status(200).json({token});
})

router.post('/login', async (req,res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    
    if (!user) res.status(401).send("The username doesn't exist or the password is incorrect");
    user.comparePassword(password, function(err, isMatch){
        if (isMatch && isMatch == true){
        
            const token = jwt.sign({_id: user._id,email:user.email}, 'secretKey');
            return res.status(200).json({token});
        }
        else {
            res.status(401).send("The username doesn't exist or the password is incorrect");
        }
    });
    
})
router.post('/sessions',async(req,res)=>{} )

router.post('/addraspy',verifyToken,async(req,res) => {

    const email = req.userId;
    await User.findOne({email})
    .then(async function(user){
       
        const username = user.username;
        const {serial_number, pin}= req.body;
        Raspi.findOne({"serial_number":serial_number}) 
        .then(async function(raspi){//add raspi
            
            if (raspi == null){
                const pin_to_check = raspis_to_add.get(serial_number);
                if (pin != pin_to_check) return res.status(401).send("Pin is incorrect");
                raspis_to_add.delete(serial_number);
                newRaspi = new Raspi({username,serial_number});
                await newRaspi.save();
                return res.sendStatus(200);
            }
            console.log(raspi);
            return res.status(401).send("Serial Number already in use");
    
        },function(err){
            console.log(err)
            return res.sendStatus(401);
        })
    },async function(err){
        console.log(err)
        return res.sendStatus(401);
    });
})

router.post('/deleteraspy',verifyToken,async(req,res) => {

    const email = req.userId;
    await User.findOne({email})
    .then(async function(user){
       
        const username = user.username;
        const serial_number = req.body;
        const raspi_to_remove = Raspi.findOne({serial_number});
        console.log(raspi_to_remove.serial_number);
        if (raspi_to_remove.username == username){ 
            Raspi.remove({serial_number});
            return res.sendStatus(200);
        }
        else return res.status(401).send("Error");
    },async function(err){
        console.log(err)
        return res.sendStatus(401);
    });
})

router.post('/getlogger', verifyRaspi, async (req,res)=>{
    // S envia serial number i tots els botons amb els nous valors
})

router.post('/initraspi',verifyRaspi, (req,res) =>{

    //Raspi fa petició de valors al server 
    const serial_number = req.body;
    Raspi.findOne({"serial_number" : serial_number}) 
    .then(function(raspi_to_return){ 
        return res.status(200).json({raspi_to_return});
    },function(err){
        console.log("Aqui");
        return res.sendStatus(401);
    })
})

router.post('/setraspi',verifyRaspi, (req,res)=>{
    const {serial_number, pin}= req.body;
    if (raspis_to_add.has(serial_number)) return res.sendStatus(401);
    else raspis_to_add.set(serial_number, pin);
    return res.sendStatus(200);
})

async function verifyToken(req, res, next){

    if (!req.headers.authorization){
        return res.status(401).send("Unauthorized Request3");       
    }
    const token = req.headers.authorization.split(' ')[1];
    if (token == null) return res.status(401).send("Unauthorized Request2");
    const payload = await jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauhtorized Request');
    }

    req.userId = payload.email;
    next();
}

async function verifyRaspi(req, res, next){

    if (!req.headers.authorization){
        return res.status(401).send("Unauthorized Request"); 
    }
    const token = req.headers.authorization.split(' ')[1];
    //console.log(req.headers.authorization.json())
    console.log(token)
    if (token == null) return res.status(401).send("Unauthorized Request2");

    const payload = await jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauhtorized Request');
    }

    if (payload.email != "raspi@raspi.raspi") return res.status(401).send('Unauhtorized Request');

    req.userId = payload.email;
    next();
}

router.get('/profile', verifyToken,async(req,res) =>{
    var email = req.userId;
    user =await User.findOne({email})
    
    .then(function(user){
        console.log(user.username)
        res.status(200).json({user: user.username });
    }).catch(function(err){
            res.status(401).json({error:err});
        }); 

})


router.post('/profile/modifypassword', verifyToken, async (req,res) => {

    const {oldpass, newpass, newpasscop} = req.body;
    var email = req.userId;
    var user = await User.findOne({email}) 
    console.log(oldpass)
    console.log(newpass)
    console.log(newpasscop)
    if (newpass != newpasscop) return res.status(401).send("The two new passwords do not match");
    if (newpass == oldpass) return res.status(401).send("The new password is the same as the old one");
    user.comparePassword(oldpass, async function(err, isMatch){
        if (isMatch && isMatch == true){
            console.log("your password has been changed successfully")
            user.password = newpass;
             await user.save();
            return res.status(200).send("Password changed successfully").json({text :'statusok'});
           
        }else{
            res.status(401).send("The old password is not correct");
        }
    });
   
   
});

module.exports = router;