const express = require('express');

const User = require('../schemas/UserSchema');
const Chat = require("../schemas/ChatSchema")
const mongoose = require("mongoose");

const router = express.Router();

//to just open the page
router.get("/", async(req, res, next) => {
    var payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    res.status(200).render("InboxPage", payload);
})

//just open thr page new Message to search users
router.get("/new", async(req, res, next) => {
    var payload = {
        pageTitle: "New Message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    res.status(200).render("newMessage", payload);
})

//open chat data with oper user and load messages
router.get("/:chatId", async(req, res, next) => {

    var userId = req.session.user._id;   //me
    var chatId = req.params.chatId;
    var isValidId = mongoose.isValidObjectId(chatId);
    
    var payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    if(!isValidId){ //عشان لو جربت احط اي دي من دماغي واحط معاه حروف وكده 
        payload.errorMessage = "chat doesn't exist or you have no permission to view it";
        return res.status(200).render("chatPage", payload);
    }

    var chat = await Chat.findOne({_id: chatId, users: { $elemMatch: {$eq: userId}}}) //get the chat with id and my id exist in this chat
        .populate("users")

    if(!chat){
        //check if chat id is really user id 
        var userFound = await User.findById(chatId)

        if(userFound !== null ){
            //get chat using user Id
            chat = await getChatByUserId( userFound._id, userId )
        }
    }
    if(!chat){
        payload.errorMessage = "chat doesn't exist or you have no permission to view it"
    }else{
        payload.chat = chat;
    }
    res.status(200).render("chatPage", payload);
})

//private chat not the group
function getChatByUserId(userLoggedInId, otherUserId){

    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                {$elemMatch: {$eq: userLoggedInId}},
                {$elemMatch: {$eq: otherUserId}}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }   
    },
    { //options 
        new: true,
        upsert: true  //if you didn't find it so create it 
    })
    .populate("users");
}


module.exports = router;