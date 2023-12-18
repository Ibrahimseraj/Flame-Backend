const mongoose = require("mongoose");
const joi = require("joi");

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });


const Comment = mongoose.model("Comment", CommentSchema);


const addCommentToPost = (obj) => {
    const shcema = joi.object({
        comment: joi.string().trim().required,
    })

    return shcema.validate(obj);
}

const updateYourComment = (obj) => {
    const shcema = joi.object({
        comment: joi.string().trim().required,
    })

    return shcema.validate(obj);
}

module.exports = { Comment, addCommentToPost, updateYourComment }