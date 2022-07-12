const router = require("express").Router();
const { authCheck } = require("../../middleware/authCheck");
const groceryListsController = require("../../controllers/groceryLists");

router.route("/").get(authCheck, groceryListsController.groceryList_getLists);

module.exports = router;
