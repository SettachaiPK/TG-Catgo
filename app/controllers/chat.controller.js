const config = require("../config/auth.config");
const db = require("../models");
const Chat = db.chat;
const Avatar = db.profile_image;

exports.chatHistory = (req, res) => {
    Chat.find({ job: req.params.job_id }).populate({path: 'user', populate: { path: 'avatar' }}).exec((err, result) => {
        if (err) {
            res.status(500).send({message: err})
        }
        let checkid = [];
        let output = [];
        for (i = 0; i < result.length - 1; i++) {
            if (!checkid.includes(result[i].user[0].avatar[0].name)){
                checkid.push(result[i].user[0].avatar[0].name)
            }
            if (result[i].user[0]._id == req.userId){
                output.push({
                    self: true,
                    message: result[i].message,
                    avatar: result[i].user[0].avatar[0].name,
                    createdAt: result[i].createdAt
                    })
            }
            else {
                output.push({
                    self: false,
                    message: result[i].message,
                    avatar: result[i].user[0].avatar[0].name,
                    createdAt: result[i].createdAt
                    })
            }
        }
        Avatar.find({ name: { $in : checkid }}).select('name value -_id').exec((err, result) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            output.push(result);
            res.status(200).send(output);
        })
    })
};