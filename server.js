const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

// give permission for fetch resource
// https://acoshift.me/2019/0004-web-cors.html
// https://stackabuse.com/handling-cors-with-node-js/
var corsOptions = {
  origin: "https://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb+srv://admin:qwertyuiopQWERTYUIOP123@tg-cargo.lcjtd.mongodb.net/Test?retryWrites=true&w=majority`, {
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

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to TG-Cargo application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/company.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/ff.routes")(app);
require("./app/routes/driver.routes")(app);
require("./app/routes/tg-admin.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
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
