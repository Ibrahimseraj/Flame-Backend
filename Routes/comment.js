const router = require("express").Router();
const { getAllComments, getSingleComment, postComment, editComment, deleteComment, getPostComments } = require("../controllers/commentController");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");



router.route("/get").get(verifyTokenAndAdmin, getAllComments);


router.route("/get/:id").get(validateObjectId, getSingleComment);


router.route("/get/by/post/:id").get(validateObjectId, getPostComments);


router.route('/add/:postId').post(verifyToken, postComment);


router.route("/edit/:id").put(validateObjectId, verifyToken, editComment);


router.route("/delete/:id").delete(validateObjectId, verifyToken, deleteComment);


module.exports = router;