const express = require("express");
const { body } = require("express-validator");
const { authenticate } = require("../middleware/auth");
const CommentController = require("../controllers/commentsController");
const postController = require("../controllers/postsController");

const router = express.Router();

// 🔹 GET all comments by logged-in user
router.get("/mine", authenticate, CommentController.mine);

// Add comment to post (auth)
router.post(
  "/:postId",
  authenticate,
  [body("content").isLength({ min: 1 }).withMessage("Content required")],
  postController.addComment
);

// Delete comment (owner OR admin)
// router.delete("/:id", authenticate, async (req, res, next) => { ... })
router.delete("/:id", authenticate, CommentController.delete);

module.exports = router;
