const postsService = require("../services/posts.service");
const { parsePagination, buildMeta } = require("../utils/pagination");

async function create(req, res) {
  const { imageUrl, authorId, caption, location } = req.body;
  if (!imageUrl || authorId === undefined || authorId === null || authorId === "") {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  const parsedAuthorId = parseInt(authorId, 10);
  if (isNaN(parsedAuthorId)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const post = await postsService.createPost({
      imageUrl,
      authorId: parsedAuthorId,
      caption,
      location
    });
    return res.status(201).json(post);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { sortBy = "createdAt", order = "desc", location, search, from, to } = req.query;

  const allowedSort = ["createdAt", "updatedAt", "likes"];
  if (!allowedSort.includes(sortBy)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const where = {};

  if (location !== undefined) {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search !== undefined) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from !== undefined || to !== undefined) {
    const createdAtFilter = {};
    if (from !== undefined) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({ error: "from and to must be valid dates" });
      }
      createdAtFilter.gte = fromDate;
    }
    if (to !== undefined) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ error: "from and to must be valid dates" });
      }
      createdAtFilter.lt = toDate;
    }
    where.createdAt = createdAtFilter;
  }

  const { skip, take, page, limit } = pagination;
  let orderBy;
  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  try {
    const { data, total } = await postsService.listPosts({ skip, take, where, orderBy });
    return res.status(200).json({
      data,
      meta: buildMeta(page, limit, total)
    });
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
