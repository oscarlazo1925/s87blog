const Comment = require("../models/Comment")

exports.mine = async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.user.id })
      .populate("author", "username")
      .populate("post", "title") // so we know which post it belongs to
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user comments" });
  }
}

exports.delete = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // owner or admin only
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Preferred: delete via document.deleteOne()
    await comment.deleteOne();

    // Alternative: await Comment.deleteOne({ _id: comment._id });
    // Alternative: await Comment.findByIdAndDelete(req.params.id);

    return res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}