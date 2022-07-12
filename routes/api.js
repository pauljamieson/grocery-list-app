const router = require("express").Router();
const profileRouter = require("./api/profile");
const authRouter = require("./api/auth");
const groceryListRouter = require("./api/groceryList");
const groceryListsRouter = require("./api/groceryLists");
const signupRouter = require("./api/signup");
const loginRouter = require("./api/login");



router.use("/profile", profileRouter);
router.use("/auth", authRouter);
router.use("/grocery-list", groceryListRouter);
router.use("/grocery-lists", groceryListsRouter);
router.use("/login", loginRouter);
router.use("/signup", signupRouter);

module.exports = router;
