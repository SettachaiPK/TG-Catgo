const config = require("../config/auth.config");
const sanitize = require('mongo-sanitize');
const db = require("../models");
const User = db.user;
const Chat = db.chat;
const Avatar = db.profile_image;

exports.chatHistory = async (req, res) => {
    try {
        const chat_content = await Chat.find({ job: sanitize(req.params.job_id) }).populate({path: 'user', populate: { path: 'avatar' }})
        const user = await User.findById(req.userId)
        let checkid = [];
        let output = [];
        for (i = 0; i < chat_content.length; i++) {
            if (!checkid.includes(chat_content[i].user[0].avatar[0].name))
            {
                checkid.push(chat_content[i].user[0].avatar[0].name)
            }
            if (chat_content[i].user[0]._id.equals(user._id))
            {
                output.push({
                    self: true,
                    message: chat_content[i].message,
                    avatar: chat_content[i].user[0].avatar[0].name,
                    createdAt: chat_content[i].createdAt
                })
            }
            else
            {
                output.push({
                    self: false,
                    message: chat_content[i].message,
                    avatar: chat_content[i].user[0].avatar[0].name,
                    createdAt: chat_content[i].createdAt
                })
            }
        }
        const avatar = await Avatar.find({ name: { $in : checkid }}).select('name value -_id')
        output.push(avatar);
        res.status(200).send(output);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({message: err})
    }
};