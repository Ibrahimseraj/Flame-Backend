const router = require("express").Router();
const { postCtrl, getAllPostCtrl, getPostByIdCtrl, updatePostCtrl, deletePostCtrl, toggleLikeCtrl, commentPostCtrl, getPostCountCtrl, getPostBySubject } = require("../controllers/postcontroller");
const { verifyToken, verifyTokenUser, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");



// /post
router.route("/").get(getAllPostCtrl);


// Assuming you have an 'express' instance named 'app'
router.route('/post/subject/:subject').get(getPostBySubject);


router.route("/count").get(getPostCountCtrl);


// /post
router.route("/:id").get(validateObjectId, getPostByIdCtrl);


// /post
router.route("/").post(verifyToken, postCtrl);


router.route("/:postId/comments").post(verifyToken, commentPostCtrl);


// /post
router.route("/:id").put(validateObjectId, verifyToken, updatePostCtrl);


// /post
router.route("/:id").delete(validateObjectId, verifyToken, deletePostCtrl);


// /like
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikeCtrl);


module.exports = router;