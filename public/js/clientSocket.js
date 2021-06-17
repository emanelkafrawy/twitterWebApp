var connected = false;

//for the client

var socket = io("http://localhost:3003") //with each login with diff email will start this and log that connected to socket

socket.emit("setup", userLoggedIn);

socket.on("connected", () =>{
    connected = true;
    // console.log(connected);
});