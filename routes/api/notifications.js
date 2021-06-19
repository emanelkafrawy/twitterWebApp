const express = require('express');

const Notification = require("../../schemas/NotificationSchema");

const router = express.Router();

router.get("/", async (req, res, next) => {

    var searchObj = {userTo: req.session.user._id, NotifiactionType: {$ne: "newMessage" } }

    if(req.query.unreadOnly !==undefined && req.query.unreadOnly =="true"){
        searchObj.opened = false;
    }

    const notifications = await Notification.find(searchObj)//$ne->not equal
            .populate("userTo")
            .populate("userFrom")
            .sort({createdAt: -1})
            .then(results =>{

                res.status(200).send(results)
            })
            .catch(err=>{
                console.log(err);
                res.sendStatus(400)
            });
})



router.get("/latest", async (req, res, next) => {

    const notifications = await Notification.findOne({userTo: req.session.user._id})//$ne->not equal
            .populate("userTo")
            .populate("userFrom")
            .sort({createdAt: -1})
            .then(results =>{

                res.status(200).send(results)
            })
            .catch(err=>{
                console.log(err);
                res.sendStatus(400)
            });
})


router.put("/:id/markAsOpened", async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, {opened: true})//$ne->not equal
            .then(results =>{
                res.sendStatus(204)
            })
            .catch(err=>{
                console.log(err);
                res.sendStatus(400)
            });
})



module.exports = router;