const mongoose = require('mongoose');
const joi = require('joi');
const passwordComplexity = require("joi-password-complexity");

const UserShecma = new mongoose.Schema({
    profilePhoto: {
        type: Object,
        default: {
            url: '',
            public_id: null
        }
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

const User = mongoose.model("User", UserShecma);

const validateUser = (obj) => {
    const shcema = joi.object({
        userName: joi.string().min(3).max(50).trim().required(),
        email: joi.string().min(5).max(100).trim().required(),
        password: passwordComplexity().required(),
        isAdmin: joi.bool()
    })

    return shcema.validate(obj);
}

const validateUpdateUser = (obj) => {
    const shcema = joi.object({
        userName: joi.string().min(3).max(50).trim(),
        email: joi.string().min(5).max(100).trim(),
        password: passwordComplexity(),
    })

    return shcema.validate(obj);
}

const validateLoginUser = (obj) => {
    const shcema = joi.object({
        email: joi.string().min(5).max(100).trim().required(),
        password: joi.string().min(3).max(100).trim().required()
    })

    return shcema.validate(obj);
}

const validateEmail = (obj) => {
    const shcema = joi.object({
        email: joi.string().min(5).max(100).required().email()
    });

    return shcema.validate(obj);
}

const validatePassword = (obj) => {
    const shcema = joi.object({
        password: passwordComplexity().required(),
    });

    return shcema.validate(obj);
}

module.exports = { User, validateUser, validateUpdateUser, validateLoginUser, validateEmail, validatePassword }