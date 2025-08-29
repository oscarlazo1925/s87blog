const express = require("express");
const { authenticate } = require("../middleware/auth");
const postController = require("../controllers/postsController")

const router = express.Router();

// List all posts (public)
router.get("/", postController.getAll);

// GET all posts of logged-in user
// 🔹 Put this BEFORE /:id
router.get("/mine", authenticate, postController.getMyPosts);

// Get single post with comments (public)
router.get("/:id", postController.getSinglePostWithComment);

// Create post (auth)
router.post("/", authenticate, postController.createPost);

// Update post (auth + owner)
router.put("/:id", authenticate, postController.updatePost);

// Delete post (owner or admin)
// NEW
router.delete("/:id", authenticate, postController.deletePost);

module.exports = router;
