/*const mongoose = require('mongoose');
//const joi = require('joi');



const VerificationTokenSchema = new mongoose.Schema({
    userId: {
        type: "mongoose.Schema.Type.ObjectId",
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    }
}, { timestamps: true });



const VerificationToken = mongoose.model('VerificationToken', VerificationTokenSchema);


module.exports = VerificationToken;*/

const mongoose = require('mongoose');



const VerificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    }
}, { timestamps: true });



const VerificationToken = mongoose.model('VerificationToken', VerificationTokenSchema);



module.exports = { VerificationToken };