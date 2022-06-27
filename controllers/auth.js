const { readUser, createToken, deleteToken } = require("../database");
const htttpResp = require("../helpers/htttpResp");
const bcrypt = require("bcrypt");
const { encodeToken } = require("../middleware/authCheck");

const rootPath = "/auth";

module.exports.auth_loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await readUser(username);
    if (user.rowCount === 0) throw "Invalid password."; // Avoid username guessing
    const passwordHash = user.rows[0].password;
    const goodPassword = await bcrypt.compare(password, passwordHash);
    if (goodPassword === false) throw "Invalid password.";
    const userId = user.rows[0]["_id"];
    const token = encodeToken(await createToken(userId));
    res.set("Access-Control-Expose-Headers", "token");
    res.set("token", token);
    res.json(htttpResp("success", "post", rootPath));
  } catch (error) {
    res.json(htttpResp("failure", "post", rootPath, { error }));
  }
};

module.exports.auth_logoutUser = async (req, res) => {
  const routePath = rootPath.concat("/logout");
  console.log(res.locals.token, "TOKEN");
  try {
    const result = await deleteToken(res.locals.token);
    res.json(htttpResp("success", "post", routePath));
  } catch (error) {
    res.json(htttpResp("failure", "post", routePath, { error }));
  }
};
