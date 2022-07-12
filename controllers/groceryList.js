const {
  createGroceryList,
  getListById,
  addItemToList,
  removeItemFromList,
  deleteGroceryList,
  setItemSelectedStatus,
  getItems,
} = require("../database");
const htttpResp = require("../helpers/htttpResp");

const rootPath = "/api/grocery-list";

module.exports.groceryList_createList = async (req, res) => {
  const { name } = req.body;
  try {
    const id = await createGroceryList(name, res.locals.userId);
    res.json(htttpResp("success", "post", rootPath, { id }));
  } catch (error) {
    res.json(htttpResp("failure", "post", rootPath, { error }));
  }
};

module.exports.groceryList_deleteList = async (req, res) => {
  const { id } = req.body;
  try {
    await deleteGroceryList(id, res.locals.userId);
    res.json(htttpResp("success", "post", rootPath));
  } catch (error) {
    res.json(htttpResp("failure", "post", rootPath, { error }));
  }
};

module.exports.groceryList_getList = async (req, res) => {
  try {
    const list = await getListById(res.locals.userId, req.params.id);
    res.json(htttpResp("success", "get", rootPath, { list }));
  } catch (error) {
    res.json(htttpResp("failure", "get", rootPath, { error }));
  }
};

module.exports.groceryList_addItemToList = async (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  try {
    const resp = await addItemToList(id, item);
    res.json(htttpResp("success", "put", rootPath, { resp }));
  } catch (error) {
    res.json(htttpResp("failure", "put", rootPath, { error }));
  }
};

module.exports.groceryList_removeItemFromList = async (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  try {
    const resp = await removeItemFromList(id, item);
    res.json(htttpResp("success", "put", rootPath, { resp }));
  } catch (error) {
    res.json(htttpResp("failure", "put", rootPath, { error }));
  }
};

module.exports.groceryList_setItemSelectedStatus = async (req, res) => {
  const { id } = req.params;
  const { item, status } = req.body;
  try {
    const resp = await setItemSelectedStatus(id, item, status);
    res.json(htttpResp("success", "put", rootPath, { resp }));
  } catch (error) {
    res.json(htttpResp("failure", "put", rootPath, { error }));
  }
};

module.exports.groceryList_getItems = async (req, res) => {
  const { filter } = req.query;
  try {
    const items = await getItems(filter);
    res.json(htttpResp("success", "get", rootPath, { items: items.rows }));
  } catch (error) {
    res.json(htttpResp("failure", "get", rootPath, { error }));
  }
};
