const { Router } = require("express");
const postsController = require("../controllers/posts.controller");
const likesController = require("../controllers/likes.controller");

const router = Router();

router.post("/", postsController.create);
router.get("/", postsController.list);
router.get("/:id", postsController.getOne);
router.patch("/:id", postsController.update);
router.delete("/:id", postsController.remove);

router.get("/:id/likes", likesController.listLikes);
router.post("/:id/likes", likesController.createLike);
router.delete("/:id/likes/:userId", likesController.deleteLike);

module.exports = router;
