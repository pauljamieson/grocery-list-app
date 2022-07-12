const router = require("express").Router();
const signupController = require("../../controllers/signup");

router.route("/").post(signupController.signup_createUser);

module.exports = router;
