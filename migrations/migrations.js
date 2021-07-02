const path = require('path');
const bcrypt = require("bcryptjs");
const root = path.dirname(require.main.filename);
const db = require("../app/models");
const fs = require("fs");
const Profile_image = db.profile_image;
const Role = db.role;
const User = db.user;
const User_detail = db.user_detail
;
exports.initial = async () => {
    try { 
        const user_count = await User.countDocuments({})
        const role_count = await Role.countDocuments({})
        const profile_imange_count = await Profile_image.countDocuments({})
        if (profile_imange_count === 0) {
            fs.readFile(root + '/default_image.txt', 'utf8',
                async function (err, data) {
                    if (err) throw err;
                    await new Profile_image({name: "default", value: data}).save()
                    console.log("added default profile image to default collection");
                });
            console.log("added default profile image to default collection");
        }
        if (role_count === 0) {
            await new Role({ name: "admin" }).save()
            await new Role({ name: "driver" }).save()
            await new Role({ name: "tg-admin" }).save()
            await new Role({ name: "tg-admin-office" }).save()
            await new Role({ name: "tg-admin-finance" }).save()
            await new Role({ name: "tg-admin-package" }).save()
            await new Role({ name: "tg-admin-deliver" }).save()
            await new Role({ name: "freight-forwarder" }).save()
            console.log("added 'admin' to roles collection");   
            console.log("added 'driver' to roles collection");
            console.log("added 'tg-admin' to roles collection");
            console.log("added 'tg-admin-office' to roles collection");
            console.log("added 'tg-admin-finance' to roles collection");            
            console.log("added 'tg-admin-package' to roles collection");            
            console.log("added 'tg-admin-deliver' to roles collection");                    
            console.log("added 'freight-forwarder' to roles collection");            
        }
        if (user_count === 0) {
            const tg_roles = await Role.findOne({ name: "tg-admin" })
            const admin_roles = await Role.findOne({ name: "admin" })
            const default_image = await Profile_image.findOne({ name: 'default' })
            const tg_user = await new User({ username: "tgadmin", password: bcrypt.hashSync("tgadmin", 8), status: true, role: tg_roles, avatar: default_image }).save()
            const admin_user = await new User({ username: "admin", password: bcrypt.hashSync("admin", 8), status: true, role: admin_roles, avatar: default_image }).save()
            const tg_user_detail = await new User_detail({ phone: "0000000000", prefix: "นาย", firstname: "TG", lastname: "Admin" }).save()
            const admin_user_detail = await new User_detail({ phone: "0000000000", prefix: "นาย", firstname: "Admin", lastname: "TG"}).save()
            tg_user.user_detail = tg_user_detail
            admin_user.user_detail = admin_user_detail
            tg_user_detail.username = tg_user
            admin_user_detail.username = admin_user
            await tg_user.save()
            await admin_user.save()
            await tg_user_detail.save()
            await admin_user_detail.save()
            console.log("added 'admin' user");   
            console.log("added 'tgadmin' user");
        }
    }
    catch (err) {
        console.log(err)
    }
}

