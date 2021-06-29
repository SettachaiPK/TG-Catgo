const db = require("../app/models");
const Profile_image = db.profile_image;
const Role = db.role;

exports.initial = () => {
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

