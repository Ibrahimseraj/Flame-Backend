const asyncHandler = require("express-async-handler");
const { Post, addPost, updatePost } = require("../models/Post");
const  { Comment } = require("../models/Comment")




/**
 * @desc get all posts
 * @route /post
 * @method GET
 * @access public
 */
/*
module.exports.getAllPostCtrl = asyncHandler(
    async (req, res) => {
        const result = await Post.find().populate("user", ["-password"]);

        res.status(200).json(result);
    }
);
*/
module.exports.getAllPostCtrl = asyncHandler(
    async (req, res) => {
      const result = await Post.aggregate([
        {
          $project: {
            subject: 1,
            description: 1,
            user: 1,
            likes: 1,
            likesCount: { $size: "$likes" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
      ]);
      
      res.status(200).json(result);
    }
);






/**
 * @desc get all posts
 * @route /post
 * @method GET
 * @access public
*/
module.exports.getPostBySubject = asyncHandler(async (req, res) => {
  const subject = req.params.subject;

  const post = await Post.findOne({ subject });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.status(200).json(post);
});


/**
 * @desc get all posts
 * @route /post/count
 * @method GET
 * @access public
*/
module.exports.getPostCountCtrl = asyncHandler(
    async (req, res) => {
        const count = await Post.countDocuments();

        res.status(200).json(count);
    }
);


/**
 * @desc get post by id
 * @route /post/:id
 * @method GET
 * @access public
 */
module.exports.getPostByIdCtrl = asyncHandler(
    async (req, res) => {
        const result = await Post.findById(req.params.id).populate("user", ["-password"]);

        if (!result) {
            return res.status(404).json({ message: "Not Found" });
        }

        res.status(200).json(result);
    }
);



/**
 * @desc add a post
 * @route /post
 * @method POST
 * @access private (only user)
*/
module.exports.postCtrl = asyncHandler(
    async (req, res) => {
        const { error } = addPost(req.body);

        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }

        const post = new Post({
            subject: req.body.subject,
            description: req.body.description,
            user: req.user.userId
        });

        const result = await post.save();

        res.status(201).json(result);
    }
);



module.exports.commentPostCtrl = asyncHandler(
    async (req, res) => {
        try {
            const postId = req.params.postId;
            const { comment } = req.body;
        
            const post = await Post.findById(postId);
        
            if (!post) {
              return res.status(404).json({ error: "Post not found" });
            }
        
            post.comment = comment;
        
            await post.save();
        
            return res.json({ message: "Comment added successfully" });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error" });
          }
    }
)



/**
 * @desc Edit A post
 * @route /post:id
 * @method PUT
 * @access private (only user)
 */
module.exports.updatePostCtrl = asyncHandler(
    async (req, res) => {
        const { err } = updatePost(req.body);

        if (err) {
            return res.status(400).json({ message: err.details[0].err });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "post not found" });
        }

        if (req.user.userId !== post.user.toString()) {
            return res.status(403).json({ message: "you are not allowed" });
        }

        const updatedpost = await Post.findByIdAndUpdate(req.params.id, {
            $set: {
                subject: req.body.subject,
                description: req.body.description
            }
        }, { new: true }).populate("user", ["-password"]);

        res.status(200).json(updatedpost);
    }
);



/**
 * @desc delete A post
 * @route /post/:id
 * @method DELETE
 * @access private (only user & Admin)
 */
/*
module.exports.deletePostCtrl = asyncHandler(
    async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "post not found" });
        }

        if (req.user.isAdmin || req.user.userId === post.user.toString()) {
            await Post.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "post successfully deleted" });
        } else {
            res.status(403).json({ message: "you are not allowed" });
        }
    }
);
*/
module.exports.deletePostCtrl = asyncHandler(
  async (req, res) => {
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.user.isAdmin || req.user.userId === post.user.toString()) {
      // Delete the post
      await Post.findByIdAndDelete(postId);

      // Delete all comments related to the post
      await Comment.deleteMany({ post: postId });

      res.status(200).json({ message: "Post and related comments successfully deleted" });
    } else {
      res.status(403).json({ message: "You are not allowed to delete this post" });
    }
  }
);



/**
 * @desc like a post and remove it
 * @route post/like/:id
 * @method PUT
 * @access private (only user)
*/
module.exports.toggleLikeCtrl = asyncHandler(
    async (req, res) => {
      try {
        const postId = req.params.id;
        const userId = req.user.userId;

        let post = await Post.findById(postId);
  
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
  
        const isPostLiked = post.likes.includes(userId);
  
        if (isPostLiked) {
          post = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: userId }
          }, { new: true });
        } else {
          post = await Post.findByIdAndUpdate(postId, {
            $push: { likes: userId }
          }, { new: true });
        }
  
        res.status(200).json({ message: "Like toggled", post });
      } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
);




/*
module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    const isPostLiked = post.likes.find((user) => user.toString() === req.user.id);

    if (isPostLiked) {
        // Remove the user's like
        post.likes = post.likes.filter((user) => user.toString() !== req.user.id);
    } else {
        // Add the user's like
        post.likes.push(req.user.id);
    }

    post = await post.save();

    res.status(200).json({ message: "Liked" });
});
*/

/*
module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id);
  
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
  
    const userIndex = post.likes.findIndex(
      (user) => user.toString() === req.user.id
    );
  
    if (userIndex !== -1) {
      // User has already liked the post, so remove the like
      post.likes.splice(userIndex, 1);
    } else {
      // User has not liked the post, so add the like
      post.likes.push(req.user.userId);
    }
  
    await post.save();
  
    res.status(200).json({ message: "Like updated" });
  });
*/

/*
module.exports.toggleLikeCtrl = asyncHandler(
    async (req, res) => {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "post not found" });
        }

        const isPostLiked = post.likes.find((user) => user.toString() === req.user.id);

        if (isPostLiked) {
            post = await Post.findByIdAndUpdate(req.params.id, {
                $pull: { likes: req.user.userId }
            }, { new: true });
        } else {
            post = await Post.findByIdAndUpdate(req.params.id, {
                $push: { likes: req.user.userId }
            }, { new: true });
        }

        res.status(200).json({ message: "Liked" })
    }
);
*/