const router = require("express").Router();
const { registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl } = require("../controllers/authcontroller");


// /user/register
router.route("/register").post(registerUserCtrl);


// /user/login
router.route("/login").post(loginUserCtrl);


// /:userId/verify/:token
router.route("/:userId/verify/:token").get(verifyUserAccountCtrl);


module.exports = router;