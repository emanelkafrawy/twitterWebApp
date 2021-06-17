const express = require('express');
const path = require("path");

const router = express.Router();
const User = require('../schemas/UserSchema');

//my profile
router.get("/", async(req, res, next)=>{
    var payload = await  getPayload(req.session.user.username, req.session.user)
    res.status(200).render("profilePage", payload)
})

//userrr profile
router.get("/:username", async(req, res, next)=>{
    
    var payload = await getPayload(req.params.username, req.session.user)

    res.status(200).render("profilePage", payload)
})

router.get("/:username/replies", async(req, res, next)=>{
    
    var payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "replies"
    res.status(200).render("profilePage", payload)
})


router.get("/:username/following", async(req, res, next)=>{
    
    var payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "following"
    res.status(200).render("FollowersAndFollowing", payload)
})
router.get("/:username/followers", async(req, res, next)=>{
    
    var payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "followers"
    res.status(200).render("FollowersAndFollowing", payload)
})


async function getPayload(username, userLoggedIn){
    var user = await User.findOne({username: username})
    if(user == null ){

        var user = await User.findById(username);
        if(user == null){
            return {
                pageTitle: "User not exist",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }
    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}
router.get("/uploads/images/:path", (req, res, next) => {
    res.sendFile(path.join(__dirname, "../uploads/images/" + req.params.path));
})

router.get("/:username/uploads/images/:path", (req, res, next) => {
    res.sendFile(path.join(__dirname, "../uploads/images/" + req.params.path));
})
module.exports = router;
