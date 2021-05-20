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
            return res.status(401).send("The username doesn't exist or the password is incorrect");
        }
    });
    
})

router.post('/setbutton', verifyToken, async(req,res)=> {
    const email = req.userId;
    await User.findOne({email})
    .then(async function(user){
        const username = user.username;
        const {serial_number, button, goal}= req.body;
        await Raspi.findOne({"serial_number":serial_number}) 
        .then(async function(raspi){
            if (button == 1) raspi.button1_goal = goal;
            else if (button == 2) raspi.button2_goal = goal;
            else if (button == 3) raspi.button3_goal = goal;
            await raspi.save();
            return res.sendStatus(200);
        }, async function(err){
            return res.sendStatus(401);
        })
    },async function(err){
        return res.sendStatus(401);
    });
})

router.post('/addraspy',verifyToken,async(req,res) => {

    const email = req.userId;
    await User.findOne({email})
    .then(async function(user){
        const username = user.username;
        const {serial_number, pin}= req.body;
        await Raspi.findOne({"serial_number":serial_number}) 
        .then(async function(raspi){//add raspi
            if (!raspi){
                const pin_to_check = raspis_to_add.get(serial_number);
                if (pin != pin_to_check) return res.status(401).send("Pin is incorrect");
                raspis_to_add.delete(serial_number);
                const button_value = "0";
                newRaspi = new Raspi({serial_number,username,button_value, button_value, button_value});
                await newRaspi.save();
                return res.sendStatus(200);
            }else return res.status(401).send("Serial Number already in use");
        
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
        const serial_number = req.body.serial_number;
        await Raspi.findOne({"serial_number":serial_number}) 
        .then(async function(raspi){
            if (raspi.username == username){ 
                await Raspi.remove({"serial_number":serial_number});
                return res.sendStatus(200);
            }
            else return res.status(401).send("Error");
    },function(err){
        console.log(err)
        return res.sendStatus(401);
    })
        },async function(err){
        return res.sendStatus(401);
    });
})


router.post('/initraspi',verifyRaspi, async (req,res) =>{

    //Raspi fa petició de valors al server 
    const serial_number = req.body.serial_number;
    await Raspi.findOne({"serial_number" : serial_number}) 
    .then(function(raspi_to_return){ 
        if (!raspi_to_return) return res.sendStatus(401);
        return res.status(200).json({raspi_to_return});
    }, async function(err){
        return res.sendStatus(401);
    })
})

router.post('/setraspi',verifyRaspi, async (req,res)=>{
    const {serial_number, pin, button1, button2, button3} = req.body;
    await Raspi.findOne({"serial_number" : serial_number}) 
    .then(async function(raspi){ 
        if (raspi){
            if (button1 == 1){
                var new_button = raspi.button1 << 0;
                raspi.button1 = new_button + 1;
            }
            if (button2 == 1){
                var new_button = raspi.button2 << 0;
                raspi.button2 = new_button + 1;
            }
            if (button3 == 1){
                var new_button = raspi.button3 << 0;
                raspi.button3 = new_button + 1;
            }
            await raspi.save();
            return res.status(200).json({raspi});
        }
        else{
            if (raspis_to_add.has(serial_number)) return res.status(401).send("Error Mapa");
            else raspis_to_add.set(serial_number, pin);
            return res.sendStatus(200);
        }
    },function(err){
        return res.sendStatus(err);
    })
})

async function verifyRaspi(req, res, next){

    if (!req.headers.authorization){
        return res.status(401).send("Unauthorized Request"); 
    }
    const token = req.headers.authorization.split(' ')[1];
    if (token == null) return res.status(401).send("Unauthorized Request");
    const payload = await jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauhtorized Request');
    }
    if (payload.email != "raspi@raspi.raspi") return res.status(401).send('Unauhtorized Request');
    req.userId = payload.email;
    next();
}


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

router.get('/profile', verifyToken,async(req,res) =>{
    var email = req.userId;
    user =await User.findOne({email})
    
    .then(function(user){
        res.status(200).json({user: user.username });
    }).catch(function(err){
            res.status(401).json({error:err});
        });
    
   
 
    
})

router.get('/myraspis',verifyToken,async(req,res) =>{
    var email = req.userId;
    await User.findOne({email})
    .then(async function(user){
        await Raspi.find({username:user.username})
        .then(function(raspi){
            res.send.status(200).json([raspi])
        },function(err){
            res.send.status(401).send("error retrieving information")
        })
    })

})
router.post('/profile/modifypassword', verifyToken, async (req,res) => {

    const {oldpass, newpass, newpasscop} = req.body;
    var email = req.userId;
    var user = await User.findOne({email}) 
    if (newpass != newpasscop) return res.status(401).send("The two new passwords do not match");
    if (newpass == oldpass) return res.status(401).send("The new password is the same as the old one");
    user.comparePassword(oldpass, async function(err, isMatch){
        if (isMatch && isMatch == true){
            console.log("Your password has been changed successfully")
            user.password = newpass;
             await user.save();
            return res.status(200).json({text :'statusok'});
           
        }else{
            res.status(401).send("The old password is not correct");
        }
    });
   
   
});

module.exports = router;

