const { createUser } = require("../database");
const htttpResp = require("../helpers/htttpResp");
const bcrypt = require("bcrypt");

module.exports.signup_createUser = async (req, res) => {
  const { username, password, email } = req.body;
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await createUser(username, hashedPassword, email);
    res.json(htttpResp("success", "post", "/signup", result));
  } catch (error) {
    res.json(htttpResp("failure", "post", "/signup", { error }));
  }
};
