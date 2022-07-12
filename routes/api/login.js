const router = require("express").Router();
const loginController = require("../../controllers/login");

router.route("/").post(loginController.login_loginUser);

module.exports = router;
