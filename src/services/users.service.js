const prisma = require("../db");

async function createUser(data) {
  return await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      ...(data.bio !== undefined ? { bio: data.bio } : {})
    }
  });
}

async function listUsers({ skip, take, where, orderBy }) {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take
    }),
    prisma.user.count({ where })
  ]);
  return { data, total };
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true
        }
      }
    }
  });
}

async function updateUser(id, data) {
  const updateData = {};
  if (data.fullname !== undefined) updateData.fullname = data.fullname;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

  return await prisma.user.update({
    where: { id },
    data: updateData
  });
}

async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id }
  });
}

async function getUserPosts(authorId, { skip, take }) {
  const where = { authorId };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        _count: {
          select: {
            likes: true
          }
        }
      }
    }),
    prisma.post.count({ where })
  ]);
  return { data, total };
}

async function getUserLikedPosts(userId, { skip, take }) {
  const where = {
    likes: {
      some: {
        userId
      }
    }
  };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    }),
    prisma.post.count({ where })
  ]);
  return { data, total };
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts
};
