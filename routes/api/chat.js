const express = require('express');

const Chat = require("../../schemas/ChatSchema")
const User = require('../../schemas/UserSchema');
const Message = require('../../schemas/MessageSchema');

const router = express.Router();

//load all chats
router.get("/", async(req, res, next) => {

    Chat.find({ users: { $elemMatch:{ $eq: req.session.user._id} }}) //eq is equal
     .populate("users")
     .populate("lastMessage")
     .sort({ "createdAt": -1 })
     .then(async results => {

        if(req.query.unreadOnly !==undefined && req.query.unreadOnly == true){
            results = results.filter(r => r.lastMessage && !r.lastMessage.readBy.includes(req.session.user._id));
        }
         results = await User.populate(results, {path:"lastMessage.sender"})
         res.status(200).send(results)
        })
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
})

router.get("/:chatId", async(req, res, next) => {

    Chat.findOne({_id: req.params.chatId, users: { $elemMatch:{ $eq: req.session.user._id} }}) //eq is equal
     .populate("users")
     .then(results => res.status(200).send(results))
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
     
})

//create a chat from the search input
router.post("/", async(req, res, next) => {
   if(!req.body.users){
       console.log("User params not sent with request"); 
       return res.sendStatus(400);
    }
    var users = JSON.parse(req.body.users);
    if(users.length == 0){
        console.log("Users array is empty"); 
        return res.sendStatus(400);
     }
     users.push(req.session.user);

     var chatData ={
         users: users,
         isGroupChat: true
     }
     Chat.create(chatData)
     .then(chat => res.status(200).send(chat))
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
})

router.put("/:chatId", async(req, res, next) => {
   Chat.findByIdAndUpdate(req.params.chatId, req.body)
     .then(results => res.sendStatus(204))
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
})

router.get("/:chatId/messages", async(req, res, next) => {

    Message.find({chat: req.params.chatId})
     .populate("sender")
     .then(results => res.status(200).send(results))
     .catch(err =>{
         console.log(err);
         res.sendStatus(400)
     })
     
})

router.put("/:chatId/messages/markAsRead", async (req, res, next) => {
    
    Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.session.user._id } })
    .then(() => res.sendStatus(204))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})
 
module.exports = router;