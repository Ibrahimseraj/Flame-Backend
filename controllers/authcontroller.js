const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, validateUser, validateUpdateUser, validateLoginUser } = require("../models/User");
const dotenv = require("dotenv").config();
//const VerificationToken = require('../models/VerificationToken');
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { VerificationToken } = require("../models/VerificationToken");
//const { invalid } = require("joi");


/**
 * @desc add user
 * @route /auth/register
 * @method POST
 * @access public
 */
module.exports.registerUserCtrl = asyncHandler(
    async (req, res) => {
        const { error } = validateUser(req.body);

        if (error) {
            return res.status(404).json({ message: error.details[0].message });
        }

        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ message: 'invalid email or password' });
        }

        const salt = await bcrypt.genSalt(10);

        req.body.password = await bcrypt.hash(req.body.password, salt);
        
        user = new User({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        });
        
        await user.save();

        const verificationToken = new VerificationToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        });

        await verificationToken.save();

        const link = `${process.env.CLIENT_URL}/${user._id}/Verify/Email/${verificationToken.token}`;

        const htmlTemplate = `
            <div>
                <p>Click on the link below</p>
                <a href="${link}">Verify Email</a>
            </div>
        `;

        await sendEmail(user.email, 'Verify Email',  htmlTemplate);
        
       res.status(201).json({ message: 'we have sent you an email, please verify your email address to login' });
});



/** 
* @desc login
* @route /auth/login
* @method POST
* @access public
*/
module.exports.loginUserCtrl = asyncHandler(
    async (req, res) => {
        const { err } = validateLoginUser(req.body);
        
        if (err) {
                 return res.status(400).json({ message: err.details[0].message });
        }
        
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
                return res.status(400).json({ message: "invaild email or password" });
        }

        const isMatchPassword = await bcrypt.compare(req.body.password, user.password);

        if (!isMatchPassword) {
            res.status(400).json({ message: "invalied email or password" });
        }

        if (!user.isAccountVerified) {
            let verificationToken = await VerificationToken.findOne({
                userId: user._id,
            });

            if (!verificationToken) {
                verificationToken = new VerificationToken({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex")
                })
            }

            await verificationToken.save();

            const link = `${process.env.CLIENT_URL}/${user._id}/Verify/Email/${verificationToken.token}`;

        const htmlTemplate = `
            <div>
                <p>Click on the link below</p>
                <a href="${link}">Verify Email</a>
            </div>
        `;

        await sendEmail(user.email, 'Verify Email',  htmlTemplate);

            return res.status(400).json({ message: "We sent to you am email, please verify your email address" });
        }

        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin}, process.env.SECRET_CODE);

        const { password, ...other } = user._doc;

        res.status(200).json({...other, token});
    }
);



/** 
* @desc verfiy user account
* @route /auth/:userId/verify/:token
* @method GET
* @access public
*/
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
  
    const verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
  
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid link" });
    }
  
    user.isAccountVerified = true;
  
    await user.save();
  
    await VerificationToken.deleteOne({ _id: verificationToken._id });
  
    res.status(200).json({ message: "Your account has been verified" });
});