const {Router} = require('express');
const router = Router();
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
router.post('/addraspy',async(req,res) => {
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
 function verifyToken(req, res, next){
    
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
    next();
}

router.get('/profile', verifyToken, (req,res) =>{
    res.send(req.userID);
})
/*
router.post('/profile/modifypassword', verifyToken, async (req,res) => {

    const {old_password, new_password1, new_password2} = req.body;
    const user = user_actual;
    console.log(user);
    
    if (new_password1 != new_password2) return res.status(401).send("The two new passwords do not match");

    user.comparePassword(old_password, function(err, isMatch){
        if (isMatch && isMatch == true){
            return res.status(401).send("The new password is the same as the old one");
        }
    });
    if (new_password1 == old_password) return res.status(401).send("The new password is the same as the old one");

    user.password = new_password1;
    await user.save();
    return res.status(200).send("Password changed successfully");
});
*/
module.exports = router;

