const router = require("express").Router();
const profileRouter = require("./api/profile");
const authRouter = require("./api/auth");

router.use("/profile", profileRouter);
router.use("/auth", authRouter);

module.exports = router;
