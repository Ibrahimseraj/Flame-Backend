const mongoose = require("mongoose");
const joi = require("joi");



const PostSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });


const Post = mongoose.model("Post", PostSchema);


const addPost = (obj) => {
    const shcema = joi.object({
        subject: joi.string().trim().required(),
        description: joi.string().trim().min(2).required(),
    })

    return shcema.validate(obj);
}


const updatePost = (obj) => {
    const schema = joi.object({
        subject: joi.string().trim(),
        description: joi.string().trim().min(2)
    });

    return schema.validate(obj);
}

module.exports = { Post, addPost, updatePost }