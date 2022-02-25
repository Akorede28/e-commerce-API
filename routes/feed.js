const express = require("express");
const { body } = require("express-validator/check");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

// creating a router by calling express as a function
const router = express.Router();

// Defining your routes
// GET /feed/posts
// validator doesn't make sense for a GET
router.get("/posts", isAuth, feedController.getPosts);

// POST /feed/posts
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
