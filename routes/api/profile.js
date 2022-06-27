const router = require("express").Router();
const { authCheck } = require("../../middleware/authCheck");
const profileController = require("../../controllers/profile");

router
  .route("/")
  .get(authCheck, profileController.profile_getProfile)
  .put(authCheck, profileController.profile_updateProfile);

module.exports = router;
