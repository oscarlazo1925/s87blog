// controllers/postController.js
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { validationResult } = require("express-validator");

exports.getAll = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    next(err);
  }
};

exports.getMyPosts = async (req, res) => {
  console.log(req.user.id, "req.user.id");
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user posts" });
  }
};

exports.getSinglePostWithComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comments = await Comment.find({ post: post._id })
      .populate("author", "username")
      .sort({ createdAt: 1 });
    return res.json({ post, comments });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: "Missing fields" });
    const post = new Post({ title, content, author: req.user._id });
    await post.save();
    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }
    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    await post.save();
    return res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne(); // ✅ modern
    return res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

//

// tambay if need mag pagination
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate("author", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    return res.json({
      posts, // ✅ matches frontend
      page, // ✅ matches frontend
      total, // ✅ matches frontend
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = new Comment({
      post: post._id,
      author: req.user._id,
      content: req.body.content,
    });
    await comment.save();
    return res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
