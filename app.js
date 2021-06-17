const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require("body-parser")
const mongoose = require("./database");
const session = require("express-session");

const server = app.listen(port, () => console.log("Server listening on port " + port));
const io = require("socket.io")(server, {pingTimeOut: 60000}) //() create instance, (server, options)

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "bbq chips",
    resave: true,
    saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const postRoute = require('./routes/postRoutes');
const logoutRoutes = require('./routes/logoutRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');

// Api routes
const postsApiRoute = require('./routes/api/posts');
const userRoutes = require('./routes/api/users');
const chatRoute = require('./routes/api/chat');
const messageRoute = require('./routes/api/messages');

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile",middleware.requireLogin, profileRoutes);
app.use("/uploads", uploadRoute);
app.use("/search",middleware.requireLogin, searchRoute);
app.use("/messages",middleware.requireLogin, messagesRoute);
app.use("/logout", logoutRoutes);

app.use("/api/posts", postsApiRoute);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }

    res.status(200).render("home", payload);
})


//client connection
//socket can rename to another names like   client
io.on("connection", (socket)=>{ 
    
    console.log("connected to socket");

    socket.on("setup", (userData) =>{ //set up is event لما السيرفر يستلم الايفنت ده هيعمل كول باك وينفذ الفانكشن دي 
        // console.log(userData.firstName); //userData is the **userLoggedIn** from client
        socket.join(userData._id);//join to this room called id or any name,send to the fron
        socket.emit("connected")
    })

    socket.on("join room", room => socket.join(room))
    socket.on("typing", room =>{
        socket.in(room).emit("typing")
    })
})