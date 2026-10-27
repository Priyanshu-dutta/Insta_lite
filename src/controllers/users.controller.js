const usersService = require("../services/users.service");

async function create(req, res) {
  const { username, email, fullname, bio } = req.body;
  if (!username || !email || !fullname) {
    return res.status(400).json({ error: "username, email and fullname are required" });
  }

  try {
    const user = await usersService.createUser({ username, email, fullname, bio });
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  const { page: rawPage, limit: rawLimit, sortBy = "createdAt", order = "desc", isPrivate, search } = req.query;

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

  const allowedSort = ["createdAt", "username", "fullname"];
  if (!allowedSort.includes(sortBy)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const where = {};
  if (isPrivate !== undefined) {
    if (isPrivate === "true") {
      where.isPrivate = true;
    } else if (isPrivate === "false") {
      where.isPrivate = false;
    } else {
      return res.status(400).json({ error: "isPrivate must be true or false" });
    }
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } }
    ];
  }

  const skip = (page - 1) * limit;
  const take = limit;
  const orderBy = { [sortBy]: order };

  try {
    const { data, total } = await usersService.listUsers({ skip, take, where, orderBy });
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
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const { fullname, bio, isPrivate } = req.body;
  try {
    const user = await usersService.updateUser(id, { fullname, bio, isPrivate });
    return res.status(200).json(user);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
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
