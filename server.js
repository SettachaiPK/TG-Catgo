const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cors = require("cors");
const path = require('path');
const fs = require("fs");
const dbConfig = require("./app/config/db.config");

const app = express();

//enable dotenv
require('dotenv').config()

// give permission for fetch resource
// https://acoshift.me/2019/0004-web-cors.html
// https://stackabuse.com/handling-cors-with-node-js/
var corsOptions = {
    origin: "http://localhost:8080"
};

// define root path
const root = path.dirname(require.main.filename);

// app.use(cors(corsOptions));
app.use(cors()); // remove corsOptions to allow all origins

// parse requests of content-type - application/json
app.use(bodyParser.json());

// enabled file upload
app.use(fileUpload({
    limits: {
        fileSize: 1000000 //1mb
    },
}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// simple route
app.get("/", (req, res) => {
    res.json({message: "Welcome to TG-Cargo application."});
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/ff.routes")(app);
require("./app/routes/driver.routes")(app);
require("./app/routes/tg-admin.routes")(app);
require("./app/routes/master-module.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

//socket.io instantiation
const io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
  });

//listen on every connection
io.on('connection', (socket) => {
    console.log(socket.id)
    console.log('New user connected')

    socket.emit('connected', { hello: 'message "HI" ' });
    socket.on('test_send', (data) => {
        console.log(data);
    })
})

// connect to database
const db = require("./app/models");
const Role = db.role;
const Profile_image = db.profile_image;

db.mongoose
    .connect(process.env.DB, {
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
