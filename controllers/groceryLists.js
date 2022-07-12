const { getListsById } = require("../database");
const htttpResp = require("../helpers/htttpResp");

const rootPath = "/api/grocery-lists";

module.exports.groceryList_getLists = async (req, res) => {
  try {
    const lists = await getListsById(res.locals.userId);
    res.json(htttpResp("success", "get", rootPath, { lists }));
  } catch (error) {
    res.json(htttpResp("failure", "get", rootPath, { error }));
  }
};
