const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const cors = require("cors");
const path = require('path');
const fs = require("fs");
const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const { user } = require("./app/models");
const Role = db.role;
const Profile_image = db.profile_image;
const Chat = db.chat;
const User = db.user;
const Notification = db.notification;
const app = express();

//enable dotenv
require('dotenv').config()

// give permission for fetch resource
// https://acoshift.me/2019/0004-web-cors.html
// https://stackabuse.com/handling-cors-with-node-js/
var corsOptions = {
    origin: process.env.CLIENTURL
};

// define root path
const root = path.dirname(require.main.filename);

// app.use(cors(corsOptions));
app.use(cors()); // remove corsOptions to allow all origins

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
require("./app/routes/public.routes")(app);
require("./app/routes/chat.routes")(app);

// set port, listen for requests
const PORT = 8081;
server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

//socket.io instantiation
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.CLIENTURL,
        methods: ["GET", "POST"],
        credentials: false
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
    
    socket.on('join', (data) => {
        console.log('join room :', data.job_id)
        socket.join(data.job_id);
    });

    socket.on('disconnect', () => {
        // console.log("A user disconnected");
    });

    socket.on('send-message', (data) => {
        console.log(data);
        User.findById(data.user_id)
        .populate('avatar')
        .exec((err, result) => {
            socket.to(data.job_id).emit('recive-message', 
            { 
                user_id: data.user_id,
                message: data.message,
                job_id: data.job_id,
                createAt: data.createAt,
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
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

function initial() {
    Profile_image.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            fs.readFile(root + '/default_image.txt', 'utf8', function(err, data) {
                if (err) throw err;
                new Profile_image({
                    name: "default",
                    value: data
                }).save(err => {
                    if (err) {
                        console.log("error", err);
                    }
                    console.log("added default profile image to default collection");
                });
            });
        }
    });
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {

            new Role({
                name: "tg-admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'tg-admin' to roles collection");
            });

            new Role({
                name: "tg-admin-office"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'tg-admin-office' to roles collection");
            });

            new Role({
                name: "tg-admin-finance"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'tg-admin-finance' to roles collection");
            });

            new Role({
                name: "tg-admin-package"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'tg-admin-package' to roles collection");
            });

            new Role({
                name: "tg-admin-deliver"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'tg-admin-deliver)' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });

            new Role({
                name: "freight-forwarder"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'freight-forwarder' to roles collection");
            });

            new Role({
                name: "driver"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'driver' to roles collection");
            });

        }
    });
}

module.exports = app;