const express = require('express');
const mongoose = require("mongoose");

const Message= require("../../schemas/MessageSchema")
const Chat = require("../../schemas/ChatSchema")
const router = express.Router();

router.post('/',(req, res, next)=>{
    if(!req.body.content || !req.body.chatId){
        console.log("not valid data");
        return res.sendStatus(400)
    }

    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };
    Message.create(newMessage)
    .then(async message =>{ 
        message = await message.populate("sender").execPopulate();
        message = await message.populate("chat").execPopulate();

        Chat.findByIdAndUpdate(req.body.chatId, {lastMessage: message})
        .catch(err =>{
            console.log(err);
        })

        res.status(201).send(message)
    })
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
})
module.exports = router;