const express = require('express');
const multer =require("multer");
const path = require("path")
const fs = require("fs") // file system

const upload = multer({dest: "uploads/"});
const User = require('../../schemas/UserSchema');
const Notifiaction = require("../../schemas/NotificationSchema")

const router = express.Router();

router.get("/", async(req, res, next)=>{
  
    var searchObj = req.query
    
    if(searchObj.search !==undefined){
        searchObj = {
            $or: [
                {firstName: {$regex: searchObj.search, $options: "i"}},
                {lasttName: {$regex: searchObj.search, $options: "i"}},
                {username: {$regex: searchObj.search, $options: "i"}}
            ]
        }
    }
    User.find(searchObj)
    .then(results =>{
        res.status(200).send(results)
    })
    .catch(err =>{
        console.log(err);
        res.sendStatus(400);
        next(err)
    })
})
router.put("/:userId/follow", async(req, res, next) => {
    const userId = req. params.userId;
    const user = await User.findById(userId);
    
    if(!user)  return res.sendStatus(404);

    let isFollowing = user.followers && user.followers.includes(req.session.user._id) // if im exist on this user followers or not
    const option = isFollowing? "$pull" : "$addToSet";

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    
    const otherUser = await User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } }, { new: true })
            .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    
    if(!isFollowing){
        await Notifiaction.insertNotification(userId, req.session.user._id, "follow", req.session.user._id)// the fourth when i click no the notifiaction go to user profile 
    }

    res.status(200).send(req.session.user);

})

router.get("/:userId/following", async(req, res, next) => {
    const userId = req.params.userId;
    const users = await User.findById(userId)
        .populate("following")
    
    if(!users)  return res.sendStatus(404);

    res.status(200).send(users);

})
router.get("/:userId/followers", async(req, res, next) => {
    const userId = req.params.userId;
    const users = await User.findById(userId)
        .populate("followers")
    
    if(!users)  return res.sendStatus(404);

    res.status(200).send(users);

})

router.post("/profilePicture",upload.single("croppedImage"), async(req, res, next) => {

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;//to get the original loaction 
    var targetPath = path.join(__dirname, `../../${filePath}`);//the new location

    fs.rename(tempPath, targetPath, async error => {//change the file allocation name or directory
        if(error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true });
        res.sendStatus(204);
    })
});

router.post("/coverPicture",upload.single("croppedImage"), async(req, res, next) => {

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;//to get the original loaction 
    var targetPath = path.join(__dirname, `../../${filePath}`);//the new location

    fs.rename(tempPath, targetPath, async error => {//change the file allocation name or directory
        if(error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true });
        res.sendStatus(204);
    })
});
module.exports = router;