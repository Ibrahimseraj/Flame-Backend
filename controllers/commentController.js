const asyncHandler = require("express-async-handler");
const { Comment, addCommentToPost, updateYourComment } = require("../models/Comment");




/**
 * @desc get all comments
 * @route /comment/get
 * @method GET
 * @access public
*/
module.exports.getAllComments = asyncHandler(
    async (req, res) => {
        const count = await Comment.countDocuments();
        const result = await Comment.find().populate("user");

        res.status(200).json({ result, count });
    }
);



/**
 * @desc get a single comment
 * @route /comment/get/:id
 * @method GET
 * @access public
*/
module.exports.getSingleComment = asyncHandler(
    async (req, res) => {
        const result = await Comment.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "comment not found" });
        }

        res.status(200).json(result);
    }
);



/**
 * @desc get comments by post
 * @route /comment/get/by/post/:id
 * @method GET
 * @access public
*/
module.exports.getPostComments = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate("user");

    if (!comments || comments.length === 0) {
        return res.status(404).json({ message: "No comments found for the given post ID" });
    }

    res.status(200).json(comments);
});



/**
 * @desc add a comment to a post
 * @route /comment/add/:postId
 * @method POST
 * @access public
*/
module.exports.postComment = asyncHandler(
    async (req, res) => {
        try {
            const postId = req.params.postId;

            const comment = new Comment({
                user: req.user.userId,
                post: postId,
                comment: req.body.comment
            });

            const result = await comment.save();

            res.status(201).json(result);
        } catch (error) {
            return res.status(400).json(error)
        }
    }
);



/**
 * @desc update the comment
 * @route /comment/edit/:id
 * @method PUT
 * @access private (only the user)
*/
module.exports.editComment = asyncHandler(
    async (req, res) => {
        try {
            const { error } = updateYourComment(req.body);

            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const comment = await Comment.findById(req.params.id);

            if (!comment) {
                return res.status(404).json({ message: "comment not found" });
            }

            if (req.user.userId !== comment.user.toString()) {
                return res.status(403).json({ message: "you are not allowed" });
            }

            const result = await Comment.findByIdAndUpdate(req.params.id, {
                $set: {
                    comment: req.body.comment
                }
            }, { new: true });

            res.status(200).json(result);
        } catch (error) {
            return res.status(400).json(error);
        }
    }
);



/**
 * @desc delete a comment
 * @route /comment/delete/:id
 * @method delete
 * @access private (the user & Admin)
*/
module.exports.deleteComment = asyncHandler(
    async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);

           if (!comment) {
               return res.status(404).json({ message: "post not found" });
           }

           if (req.user.isAdmin || req.user.userId === comment.user.toString()) {
               await Comment.findByIdAndDelete(req.params.id);
               res.status(200).json({ message: "post successfully deleted" });
           } else {
               res.status(403).json({ message: "you are not allowed" });
           }
        } catch (error) {
           return res.status(400).json(error);
        }
    }
);