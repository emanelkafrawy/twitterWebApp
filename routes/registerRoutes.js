const express = require('express');
const bcrypt = require("bcrypt");

const User = require('../schemas/UserSchema');

const router = express.Router();

router.get("/", (req, res, next) => {

    res.status(200).render("register");
})

router.post("/", async (req, res, next) => {

    try{
        var firstName = req.body.firstName.trim();
        var lastName = req.body.lastName.trim();
        var username = req.body.username.trim();
        var email = req.body.email.trim();
        var pass = req.body.password;
        
        var payload = req.body;
        payload.pageTitle = "register"; 
        console.log(payload);
        if(firstName && lastName && username && email && pass){
            const user = await User.findOne({
                $or:[
                    { username: username },
                    { email: email }
                ]
            })
            if(user){  //user exist 
                if(email === user.email){
                    payload.errorMessage = "email already exist"
                }else{
                    payload.errorMessage = " username already exist"
                }
                res.status(200).render('register', payload);
            }else{ //not exist
                const password = await bcrypt.hash(pass, 10);
                const newUser = new User({
                    firstName:firstName,
                    lastName: lastName, 
                    username: username,
                    email: email,
                    password: password
                });
                req.session.user = newUser;
                const result = await newUser.save();
                return res.redirect("/");
            }
        }
        else{
            payload.errorMessage = "make sure each field has a value";
           res.status(500).render('register', payload);
        }
    }
    catch(err){
        next(err)
        payload.errorMessage = "something get wrong";
        res.status(500).render('register', payload);
    }
})

module.exports = router;