const config = require("../config/auth.config");
const sanitize = require('mongo-sanitize');
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;
const Profile_image = db.profile_image;
const Notification = db.notification;

const bcrypt = require("bcryptjs");

exports.userDetail = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('role').populate('user_detail').populate('avatar')
        res.status(200).send({
            prefix: user.user_detail[0].prefix,
            firstname: user.user_detail[0].firstname,
            lastname: user.user_detail[0].lastname,
            phone: user.user_detail[0].phone,
            avatar: user.avatar[0].value,
        });
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.editPersonalInfo = async (req, res) => {
    try {
        let image_data = {};
        if(req.files) {
            image_data = req.files.avatar;
            if(!image_data.name.match(/\.(jpg|jpeg|png)$/i)) {
                res.status(415).send({message: "wrong file type"});
                return;
            }
            if(image_data.truncated){
                res.status(413).send({message: "file too large"});
                return;
            }
        }
        const user = await User.findById(req.userId).populate('role').populate('user_detail').populate('avatar')
        console.log(user.avatar[0]._id)
        if(req.files) {
            const docs = await Profile_image.find({name: "default"})
            // user doesn't have profile image
            if (user.avatar[0]._id.equals(docs[0]._id)) {
                const result = await new Profile_image({
                    name: user._id,
                    value: image_data.data.toString('base64')
                }).save()
                await user.updateOne({'avatar': result}, [])
            }
            // user has profile image
            else {
                await user.avatar[0].updateOne({value: image_data.data.toString('base64')}, [])
            }
        }
        await user.user_detail[0].updateOne( { 
            prefix: req.body.prefix,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone }, [])
            res.status(200).send({message: "updated"})
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({message: err});
    }
}

exports.getUserCompanyDetail = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({ path: 'tax_id', populate: { path: 'company_detail' }})
        res.status(200).send({
            'name' : user.tax_id[0].company_name,
            'address' : user.tax_id[0].company_detail[0].address,
            'province' : user.tax_id[0].company_detail[0].company_province,
            'zipcode' : user.tax_id[0].company_detail[0].company_postal,
            'taxId' : user.tax_id[0].tax_id
        })
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

exports.updateOneCompanyDetail = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({ path: 'tax_id', populate: { path: 'company_detail' }})
        const company = await Company.findById(user.tax_id[0]._id)
        await company.updateOne({company_name: req.body.companyName}, [])
        const company_detail = await Company_detail.findById(company.company_detail[0]._id)
        await company_detail.updateOne({
            company_name: req.body.companyName,
            address: req.body.address,
            company_province: req.body.province,
            company_postal: req.body.postal
        }, [])
        res.status(200).send({message: "updated"})
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({message: err});
    }
}
exports.changePwd = async (req, res) => {
    try {
        const user_callback = await User.findById(req.userId)
        const check_password = await bcrypt.compare(req.body.oldpassword, user_callback.password)
        if (check_password) {
            const doc = await user_callback.updateOne({password: bcrypt.hashSync(req.body.newpassword, 8)}, [])
            res.status(200).send({message: "updated"});
        }
        else {
            res.status(401).send({message: "Your old password are not correct"});
        }
    }
    catch (err) {
        res.status(500).send({message: err});
    }
};

exports.showNotification = async (req, res) => {
    try {
        const notification = await Notification.find({user: req.userId})
        res.status(200).send(notification);
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.selectAndRemoveNotification = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.userId})
        user.notification -= 1;
        user.save();
        const noti = await Notification.deleteOne({ _id: sanitize(req.body.notification_id)})
        res.status(200).send({message: "notification cleard"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

