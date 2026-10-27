const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  // 1. Delete children first
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users and get created rows back
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((u) => ({
      username: u.username,
      email: u.email,
      fullname: u.fullname,
      bio: u.bio,
      isPrivate: u.isPrivate,
      createdAt: new Date(u.createdAt)
    }))
  });

  // 3. Lookup: username -> id
  const userMap = new Map();
  createdUsers.forEach((u) => userMap.set(u.username, u.id));

  // 4. Create posts with real authorId
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((p) => ({
      imageUrl: p.imageUrl,
      caption: p.caption,
      location: p.location,
      createdAt: new Date(p.createdAt),
      authorId: userMap.get(p.author)
    }))
  });

  // 5. Lookup: insta## -> post id
  const postMap = new Map();
  createdPosts.forEach((p) => {
    const match = p.imageUrl.match(/insta\d+/);
    if (match) {
      postMap.set(match[0], p.id);
    }
  });

  // 6. Create likes
  const createdLikes = await prisma.like.createManyAndReturn({
    data: likes.map((l) => ({
      userId: userMap.get(l.user),
      postId: postMap.get(l.post)
    }))
  });

  // 7. Print message
  console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
