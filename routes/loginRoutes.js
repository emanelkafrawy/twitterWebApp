const express = require('express');
const bcrypt = require("bcrypt");

const User = require('../schemas/UserSchema');

const router = express.Router();


router.get("/", (req, res, next) => {
    
    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {
    try{

        var payload = req.body;
    
        if(req.body.logUsername && req.body.logPassword) {
            var user = await User.findOne({
                $or: [
                    { username: req.body.logUsername },
                    { email: req.body.logUsername }
                ]
            })
            
            if(user != null) {
                var result = await bcrypt.compare(req.body.logPassword, user.password);
    
                if(result === true) {
                    req.session.user = user;
                    return res.redirect("/");
                }
            }
    
            payload.errorMessage = "Login credentials incorrect.";
            return res.status(200).render("login", payload);
        }
    
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("login");
    }
    catch(err){
        next(err)
        payload.errorMessage = "something get wrong";
        res.status(500).render('register', payload);
    }
})

module.exports = router;