const prisma = require("../db");

async function createPost(data) {
  return await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      authorId: data.authorId,
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.location !== undefined ? { location: data.location } : {})
    }
  });
}

async function listPosts({ skip, take, where, orderBy }) {
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
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

async function getPostById(id) {
  return await prisma.post.findUnique({
    where: { id },
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
  });
}

async function updatePost(id, data) {
  const updateData = {};
  if (data.caption !== undefined) updateData.caption = data.caption;
  if (data.location !== undefined) updateData.location = data.location;

  return await prisma.post.update({
    where: { id },
    data: updateData
  });
}

async function deletePost(id) {
  return await prisma.post.delete({
    where: { id }
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost
};
