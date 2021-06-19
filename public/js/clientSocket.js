var connected = false;

//for the client

var socket = io("http://localhost:3003") //with each login with diff email will start this and log that connected to socket

socket.emit("setup", userLoggedIn);

socket.on("connected", () =>{
    connected = true;
    // console.log(connected);
});

//theck if the other user recieve the message when he was in the home page or any page or exist in the chat page

socket.on("message received",  (newMessage) => messageReceived(newMessage)); //common.js

socket.on("notification received",  () => {
    $.get("/api/notifications/latest", (notificationData)=>{
        showNotificationPopup(notificationData)
        refreshNotificationsBade()
    })
}); 

function emitNotification(userId){
    if(userId == userLoggedIn._id) return ;

    socket.emit("notification received", userId);
}
