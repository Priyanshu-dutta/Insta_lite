const prisma = require("../db");

async function getLikesByPostId(postId) {
  const likes = await prisma.like.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true
        }
      }
    },
    orderBy: {
      user: {
        username: "asc"
      }
    }
  });

  return likes.map((l) => l.user);
}

async function addLike(postId, userId) {
  return await prisma.like.create({
    data: {
      postId,
      userId
    }
  });
}

async function removeLike(postId, userId) {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId
      }
    }
  });
}

module.exports = {
  getLikesByPostId,
  addLike,
  removeLike
};
