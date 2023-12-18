const nodemailer = require('nodemailer');



module.exports = async (userEmail, subject, htmlTemplate) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.TEAM_EMAIL,
                pass: process.env.TEAM_EMAIL_PASSWORD
            }
        });

        const mailOpreation = {
            from: "Logo Team",
            to: userEmail,
            subject: subject,
            html: htmlTemplate
        }

        const info = await transporter.sendMail(mailOpreation);
    } catch (error) {
        console.log(error);
        throw new Error("Internal server error (nodemailer)")
    }
}