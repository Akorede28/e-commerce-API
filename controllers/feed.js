const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  try {
    const posts = await Post.find();
    res.status(200).json({
      message: "fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = (req, res, next) => {
  // validating error code

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  console.log(req.file);
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  // creating a new model
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    console.log("post gotten success", post);
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// exports.updatePost = (req, res, next) => {
//   // validating error code
//   const error = validationResult(req);
//   if (!error.isEmpty()) {
//     const error = new Error();
//   }
//   const postId = req.params.postId;
//   const title = req.body.title;
//   const content = req.body.content;
//   let imageUrl = req.body.image;
//   if (req.file) {
//     imageUrl = req.file.path;
//   }
//   if (!imageUrl) {
//     const error = new Error("No file picked.");
//     error.statusCode = 422;
//     throw error;
//   }
//   Post.findById(postId)
//     .then((post) => {
//       if (!post) {
//         const error = new Error("could not find post");
//         error.statusCode = 404;
//         throw error;
//       }
// post.title = title;
// post.imageUrl = imageUrl;
// post.content = content;
// return post.save()
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//     });
// };

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    // validating error code
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const error = new Error();
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error("No file picked.");
      error.statusCode = 422;
      throw error;
    }
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("could not find post");
      error.statusCode = 404;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    console.log(post, "this is a post we are testing");
    return post;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
