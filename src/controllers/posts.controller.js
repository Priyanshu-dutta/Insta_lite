const postsService = require("../services/posts.service");

async function create(req, res) {
  const { imageUrl, caption, location } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const post = await postsService.createPost({ imageUrl, caption, location });
    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  try {
    const posts = await postsService.listPosts();
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { caption, location } = req.body;
  try {
    const post = await postsService.updatePost(id, { caption, location });
    return res.status(200).json(post);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove
};
