const { createUser, readUser, createToken } = require("../database");
const htttpResp = require("../helpers/htttpResp");
const bcrypt = require("bcrypt");

const rootPath = "/login";

module.exports.login_loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await readUser(username);
    if (user.rowCount === 0) throw "Invalid password."; // Avoid username guessing
    const passwordHash = user.rows[0].password;
    const goodPassword = bcrypt.compare(password, passwordHash);
    if (goodPassword === false) throw "Invalid password.";
    const userId = user.rows[0]["_id"];
    const token = await createToken(userId);
    res.json(htttpResp("success", "post", rootPath, { token }));
  } catch (error) {
    res.json(htttpResp("failure", "post", rootPath, { err }));
  }
};
