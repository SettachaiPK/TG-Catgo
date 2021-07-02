const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const cors = require("cors");
const path = require('path');
const db = require("./app/models");
const migrations = require("./migrations/migrations");
const Chat = db.chat;
const User = db.user;
const Notification = db.notification;

const app = express();

//enable helmet security
app.use(helmet());

//enable dotenv
require('dotenv').config()

// give permission for fetch resource
// https://acoshift.me/2019/0004-web-cors.html
// https://stackabuse.com/handling-cors-with-node-js/

const corsOptions = {
    origin: /localhost:8080$/, // น้ำตาจะไหล ลืมใส่ regex
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors(corsOptions)); 

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cookieParser());

// enabled file upload
app.use(fileUpload({
    limits: {
        fileSize: 1000000 //1mb
    },
}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/ff.routes")(app);
require("./app/routes/driver.routes")(app);
require("./app/routes/tg-admin.routes")(app);
require("./app/routes/master-module.routes")(app);
require("./app/routes/chat.routes")(app);

// set port, listen for requests
const PORT = 8081;
server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

//socket.io instantiation
const io = require("socket.io")(server, {
    cors: {
        origin: /localhost:8080$/,
        methods: ["GET", "POST"],
        credentials: true
    }
  });
//listen on every connection
io.on('connection', (socket) => {
    socket.on('join-with-id',(data) => {
        socket.join(data.user_id);
        User.findById(data.user_id).exec((err,user) => {
            io.in(data.user_id).emit('receive-notify',
            { 
                user_id: data.user_id,
                notification:  user.notification
            });
            }
        );
    });
    socket.on('sent-realtime-notify' , (data) =>{
        Notification.findById(data.user_id)
        .exec( (err, noti) => {
            console.log(typeof data.user_id);
            socket.to(data.user_id).emit('get-count-notify',{
                createdAt: Date.now(),
                detail: data.content,
                id: data.id,
            });
        })
    });
    
    socket.on('join', (data) => {
        console.log('join room :', data.job_id)
        socket.join(data.job_id);
    });

    socket.on('disconnect', () => {
        // console.log("A user disconnected");
    });

    socket.on('send-message', (data) => {
        User.findById(data.user_id)
        .populate('avatar')
        .exec((err, result) => {
            socket.to(data.job_id).emit('recive-message', 
            { 
                user_id: data.user_id,
                message: data.message,
                job_id: data.job_id,
                createdAt: new Date(data.createdAt),
                avatar: result.avatar[0].value,
                username: result.username
            });
            const chat = new Chat({
                message: data.message,
                });    
            chat.user.push(data.user_id);
            chat.job.push(data.job_id);
            chat.save();
        });
    })
})

// connect to database
db.mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        migrations.initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

module.exports = app;