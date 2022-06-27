const router = require("express").Router();
const authController = require("../../controllers/auth");
const { authCheck } = require("../../middleware/authCheck");

router.route("/logout").post(authCheck, authController.auth_logoutUser);

module.exports = router;
