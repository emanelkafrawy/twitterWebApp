const express = require('express');
const mongoose = require("mongoose");

const Message= require("../../schemas/MessageSchema")
const Chat = require("../../schemas/ChatSchema");
const User = require('../../schemas/UserSchema');
const Notification = require('../../schemas/NotificationSchema');

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

        message = await User.populate(message, {path: "chat.users"}); //do that for the socket
        var chat = await Chat.findByIdAndUpdate(req.body.chatId, {lastMessage: message})
        .catch(err =>{
            console.log(err);
        })

        insertNotification(chat,message);
    
        res.status(201).send(message)
    })
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
})

function insertNotification(chat, message){

    chat.users.forEach(userId => {
        if(userId == message.sender._id.toString()) return ;
        Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id)
    });
}
module.exports = router;