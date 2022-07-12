const { readUser, updatePassword, updateEmail } = require("../database");
const htttpResp = require("../helpers/htttpResp");
const bcrypt = require("bcrypt");

module.exports.profile_getProfile = async (req, res) => {
  const rootPath = "/api/profile";
  const user = (await readUser(res.locals.username)).rows[0];
  const { password, _id, ...details } = user;
  try {
    res.json(htttpResp("success", "get", rootPath, { details }));
  } catch (error) {
    res.json(htttpResp("failure", "get", rootPath, { error }));
  }
};

module.exports.profile_updateProfile = async (req, res) => {
  const { field } = req.body;
  const rootPath = "/api/profile";
  if (field === "password") {
    const { newPassword, oldPassword } = req.body;
    const saltRounds = 10;
    try {
      const user = (await readUser(res.locals.username)).rows[0];
      const matched = await bcrypt.compare(oldPassword, user.password);
      if (matched)
        await updatePassword(
          user._id,
          await bcrypt.hash(newPassword, saltRounds)
        );
      res.json(htttpResp("success", "put", rootPath));
    } catch (error) {
      res.json(htttpResp("failure", "put", rootPath, { error }));
    }
  } else if (field === "email") {
    const { email } = req.body;
    try {
      const user = (await readUser(res.locals.username)).rows[0];
      const result = await updateEmail(user._id, email);
      res.json(htttpResp("success", "put", rootPath));
    } catch (error) {
      res.json(htttpResp("failure", "put", rootPath, { error }));
    }
  }
};
