const asyncHandler = require('express-async-handler');
const { User, validateEmail, validatePassword } = require('../models/User');
const crypto = require("crypto");
const { VerificationToken } = require("../models/VerificationToken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");



/**
 * @desc send reset password link
 * @route /password/reset/link
 * @method POST
 * @access public
*/
module.exports.resetPasswordLinkCtrl = asyncHandler(
    async (req, res) => {
        const { error } = validateEmail(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).message({ message: "user by this email doesn't exist" })
        }

        let verificationToken = await VerificationToken.findOne({ userId: user._id });

        if (!verificationToken) {

            verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex")
            });

            await verificationToken.save();
        }

        const link = `${process.env.CLIENT_URL}/reset/password/${user._id}/${verificationToken.token}`;

        const htmlTemplate = `
            <div>
                <p>click on the link below to reset your password</p>
                <a href="${link}">reset password</a>
            </div>
        `;

        await sendEmail(user.email, 'reset password', htmlTemplate);

        res.status(200).json({ message: "A link sent to your email, please check to reset your password" });
    }
);



/**
 * @desc get reset password link
 * @route /password/reset/link/:userId/:token
 * @method GET
 * @access public
*/
module.exports.getResetPasswordLinkCtrl =asyncHandler(
    async (req, res) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(400).json({ message: 'invalid link user is not here mate!' });
        }

        const verificationToken = await VerificationToken.findOne({
            userId: user._id,
            token: req.params.token
        });

        if (!verificationToken) {
            return res.status(400).json({ message: 'invalid link the whole proceess fix that one agian mate!' });
        }

        res.status(200).json({ message: 'Vaild URL' });
    }
);



/**
 * @desc reset password
 * @route /password/reset/link/:userId/:token
 * @method POST
 * @access public
*/
module.exports.passwordResetCtrl = asyncHandler(
    async (req, res) => {
        const { error } = validatePassword(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(400).message({ message: "Invalid link user mate" });
        }

        const verificationToken = await VerificationToken.findOne({
            userId: user._id,
            token: req.params.token
        })

        if (!verificationToken) {
            return res.status(400).json({ message: "Invaild link link mate" });
        }

        if (!user.isAccountVerified) {
            user.isAccountVerified = true;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        user.password = hashedPassword;

        await user.save();
        
        //await verificationToken.remove();

        res.status(200).json({ message: "password reset successfully, please log in" });
    }
);