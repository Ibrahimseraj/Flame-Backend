const router = require("express").Router();
const { getUserCtrl, getByIdUserCtrl, putUserCtrl, deleteUserCtrl, getYourProfile, getUserBySearching, adminAccessToUserCtrl, uploadProfilePhoto } = require("../controllers/usercontroller");
const { verifyToken, verifyTokenAndAdmin, verifyTokenUser, verifyTokenAuthorization } = require("../middlewares/verifyToken");
const photoUpload = require("../middlewares/imagesUpload"); 
const validateObjectId = require("../middlewares/validateObjectId");



// /profile/get
router.route("/get").get(verifyTokenAndAdmin, getUserCtrl);


// /profile/me
router.route("/me").get(verifyToken, getYourProfile);


// /profile/:id
router.route("/:id").get(validateObjectId, getByIdUserCtrl);


// /profile/search/:userName
router.route("/search/:userName").get(getUserBySearching);


router.route("/photo").post(verifyToken, photoUpload.single('images'), uploadProfilePhoto);


// /profile/:id
router.route("/:id").put(validateObjectId, verifyTokenUser, putUserCtrl);


// /profile/admin/access/:id
router.route("/admin/access/:id").put(validateObjectId, verifyTokenAndAdmin, adminAccessToUserCtrl);


// /profile/:id
router.route("/:id").delete(validateObjectId, verifyTokenAuthorization, deleteUserCtrl);


module.exports = router;