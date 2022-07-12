const router = require("express").Router();
const { authCheck } = require("../../middleware/authCheck");
const groceryListController = require("../../controllers/groceryList");

router
  .route("/")
  .get(authCheck, groceryListController.groceryList_getItems)
  .post(authCheck, groceryListController.groceryList_createList)
  .delete(authCheck, groceryListController.groceryList_deleteList);

router
  .route("/:id")
  .get(authCheck, groceryListController.groceryList_getList)
  .put(authCheck, groceryListController.groceryList_addItemToList)
  .patch(authCheck, groceryListController.groceryList_setItemSelectedStatus)
  .delete(authCheck, groceryListController.groceryList_removeItemFromList);

module.exports = router;
