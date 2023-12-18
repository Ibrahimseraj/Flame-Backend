const router = require("express").Router();
const { resetPasswordLinkCtrl, getResetPasswordLinkCtrl, passwordResetCtrl } = require("../controllers/passwordcontroller");



router.route("/reset/link/:userId/:token").get(getResetPasswordLinkCtrl);


router.route("/reset/link").post(resetPasswordLinkCtrl);


router.route("/reset/link/:userId/:token").post(passwordResetCtrl);



module.exports = router;