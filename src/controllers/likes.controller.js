const likesService = require("../services/likes.service");
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");

async function listLikes(req, res) {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = await postsService.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const users = await likesService.getLikesByPostId(postId);
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createLike(req, res) {
  const { userId } = req.body;
  if (userId === undefined || userId === null || userId === "") {
    return res.status(400).json({ error: "userId is required" });
  }

  const postId = parseInt(req.params.id, 10);
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(postId)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = await postsService.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (isNaN(parsedUserId)) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = await usersService.getUserById(parsedUserId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const like = await likesService.addLike(postId, parsedUserId);
    return res.status(201).json(like);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteLike(req, res) {
  const postId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(postId) || isNaN(userId)) {
    return res.status(404).json({ error: "Like not found" });
  }

  try {
    await likesService.removeLike(postId, userId);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listLikes,
  createLike,
  deleteLike
};
