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
  const { page: rawPage, limit: rawLimit, sortBy = "createdAt", order = "desc", location, search, from, to } = req.query;

  if (rawPage !== undefined) {
    if (!/^\d+$/.test(String(rawPage).trim()) || parseInt(rawPage, 10) <= 0) {
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }
  }

  if (rawLimit !== undefined) {
    if (!/^\d+$/.test(String(rawLimit).trim()) || parseInt(rawLimit, 10) <= 0) {
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }
  }

  const page = rawPage !== undefined ? parseInt(rawPage, 10) : 1;
  let limit = rawLimit !== undefined ? parseInt(rawLimit, 10) : 10;
  if (limit > 50) {
    limit = 50;
  }

  const allowedSort = ["createdAt", "updatedAt"];
  if (!allowedSort.includes(sortBy)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt" });
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

  const skip = (page - 1) * limit;
  const take = limit;
  const orderBy = { [sortBy]: order };

  try {
    const { data, total } = await postsService.listPosts({ skip, take, where, orderBy });
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return res.status(200).json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
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
