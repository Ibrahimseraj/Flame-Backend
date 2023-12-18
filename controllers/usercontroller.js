const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary');
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");



/**
 * @desc get all users
 * @route /profile
 * @method GET
 * @access private only admin
*/
/*
module.exports.getUserCtrl = asyncHandler(
    async (req, res) => {
            const result = await User.find().select("-password");
            res.status(200).json(result);
    }
);
*/

/**
 * @desc get all users
 * @route /profile
 * @method GET
 * @access private only admin
*/
module.exports.getUserCtrl = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    const users = await User.find().select("-password");
    res.status(200).json({ count, users });
});



module.exports.getYourProfile = asyncHandler(
    async (req, res) => {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            const posts = await Post.find({ user: req.user.userId });
            res.status(200).json({ user, posts });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }    
);



/**
 * @desc get user by id
 * @route /profile/:id
 * @method GET
 * @access public
*/
/*
module.exports.getByIdUserCtrl = asyncHandler(
    async (req, res) => {
        const user  = await User.findById(req.params.id).select("-password");
        const posts = await Post.find({ user });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        res.status(200).json({ user, posts });
    }
);
*/

/**
 * @desc get user by id
 * @route /profile/:id
 * @method GET
 * @access public
 */
module.exports.getByIdUserCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
  
    const posts = await Post.find({ user });
  
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
  
    const postCount = posts.length;
  
    res.status(200).json({ user, posts, postCount });
  });



/**
 * @desc get user by searching
 * @route /seach
 * @method GET
 * @access public
*/
module.exports.getUserBySearching = asyncHandler(
    async (req, res) => {
        const { userName } = req.params;

        try {
          const regex = new RegExp(`^${userName}`, 'i');
          const users = await User.find({ userName: { $regex: regex } });
      
          res.status(200).json(users);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server Error' });
        }
    }
);



/*
module.exports.getUserBySearching = async (req, res) => {
    const { userName } = req.params;
    try {
      const user = await User.find({ city: { $regex: userName, $options: "i" } });
  
      if (user.length > 0) {
        res.json(user);
        console.log(user)
      } else {
        res.status(404).json({ message: "No user found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
};
*/


/**
* @desc upload user
* @route /profile/photo
* @method POST
* @access private
*/
module.exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'no file provided' });
    }

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    const result = await cloudinaryUploadImage(imagePath);

    const user = await User.findById(req.user.userId);

    if (user.profilePhoto.public_id !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.public_id);
    }

    user.profilePhoto = {
        url: result.secure_url,
        public_id: result.public_id
    };

    await user.save();

    res.status(200).json({ 
        message: "successfully uploaded",
        profilePhoto: { url: result.secure_url, public_id: result.public_id }
    });

    fs.unlinkSync(imagePath);
});


/**
* @desc update user
* @route /profile/:id
* @method PUT
* @access private
*/
module.exports.putUserCtrl = asyncHandler(
    async (req, res) => {
            const { error } = validateUpdateUser(req.body);
    
            if (error) {
                return res.status(404).json({ message: error.details[0].message });
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
    
            const result = await User.findByIdAndUpdate(req.params.id, {
                    $set: {
                        userName: req.body.userName,
                        email: req.body.email,
                        password: req.body.password
                    }
            }, { new: true }).select("-password");
    
            res.status(200).json(result);
    }
);



/**
* @desc update user
* @route /profile/admin/access/:id
* @method PUT
* @access private
*/
module.exports.adminAccessToUserCtrl = asyncHandler(
    async (req, res) => {
        const result = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                isAdmin: req.body.isAdmin
            }
        }, { new: true });

        res.status(200).json(result);
    }
);



/**
* @desc delete user
* @route /profile/:id
* @method delete
* @access private
*/
/*
module.exports.deleteUserCtrl = asyncHandler(
 async (req, res) => {
         const result = await User.findById(req.params.id);

         if (result) {
                 await User.findByIdAndDelete(req.params.id);
                 res.status(200).json({ message: 'your porfile Deleted Sucssfully' });
         } else {
                 res.status(404).json({ message: 'Not Found' })
         }
 }
);
*/
module.exports.deleteUserCtrl = asyncHandler(
    async (req, res) => {
      const userId = req.params.id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find all posts by the user
      const userPosts = await Post.find({ user: userId });
  
      // Delete all comments related to the user's posts
      await Comment.deleteMany({ post: { $in: userPosts.map(post => post._id) } });
  
      // Delete all posts by the user
      await Post.deleteMany({ user: userId });
  
      // Delete the user
      await User.findByIdAndDelete(userId);
  
      res.status(200).json({ message: "User, related posts, and comments successfully deleted" });
    }
  );