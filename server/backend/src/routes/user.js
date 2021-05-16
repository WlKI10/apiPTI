const {Router} = require('express');
const router = Router();
const Raspi = require('../models/Raspi');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const saltRounds = 10;


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
            res.status(401).send("The username doesn't exist or the password is incorrect");
        }
    });
    
})
router.post('/sessions',async(req,res)=>{} )

router.post('/addraspy',verifyandLookToken,async(req,res) => {
   
})
router.get('/tasks', (req,res)=>{
    res.json([
        {
            _id:1,
            name: 'Task one',
            description: 'lorem ipsum',
            date: "2021-04-03T11:52:41.220Z"
        },
        {
            _id:2,
            name: 'Task two',
            description: 'lorem ipsum',
            date: "2021-04-03T11:52:41.220Z"
        },
        {
            _id:3,
            name: 'Task three',
            description: 'lorem ipsum',
            date: "2021-04-03T11:52:41.220Z"
        },
    ])
})
router.get('/profile-data',)
router.get('/private-tasks', verifyToken, (req,res)=>{
    res.json([
        {
            _id:1,
            name: 'Task one',
            description: 'lorem ipsum',
            date: "2021-04-03T11:52:41.220Z"
        },
        {
            _id:2,
            name: 'Task two',
            description: 'lorem ipsum',
            date: "2021-04-03T11:52:41.220Z"
        },
        {
            _id:3,
            name: 'Task three',
            description: 'lorem ipsum',
            date: "2021-04-03T11:52:41.220Z"
        },
    ])
})

//router.get('/dashboard',)
async function verifyandLookToken(req, res, next){
    
    if (!req.headers.authorization){
        return res.status(401).send("Unauthorized Request3");
    }
    const token = req.headers.authorization.split(' ')[1];
    //console.log(req.headers.authorization.json())
    console.log(token)
    if (token == null) return res.status(401).send("Unauthorized Request2");
    const payload =  jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauhtorized Request');
    }

    req.userId = payload._id;
      User.findOne({_id: userId})
     .then(function(user){//tenemos el usuario
        
         Raspi.findOne({username:user.username}).then
         (function(userRaspi){//add raspi 
           
          
         },function(err){
         //hemos de añadir la primera raspi
         const username = userRaspi.username
         const  {reference,pin}= req.body
          newRaspi = new Raspi(username,[{reference,pin}])
          newRaspi.save()
         
         
        }
         )
        // Do something with the user
       
        
       return res.send(200)
    },async function(err){//tenemos que añadir usuario,raspi y pin
        console.log(err)
        return res.send(401);
    });
    next();
}
  async function verifyToken(req, res, next){
    
    if (!req.headers.authorization){
        return res.status(401).send("Unauthorized Request3");
    }
    const token = req.headers.authorization.split(' ')[1];
    //console.log(req.headers.authorization.json())
    console.log(token)
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
            return res.status(200).json({text :'statusok'});
           
        }else{
            res.status(401).send("The old password is not correct");
        }
    });
   
   
});

module.exports = router;

