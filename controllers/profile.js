const { readUser, updatePassword } = require("../database");
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
  console.log(field);
  if (field === "password") {
    const { newPassword, oldPassword } = req.body;
    const saltRounds = 10;
    const rootPath = "/api/profile";
    try {
      const user = (await readUser(res.locals.username)).rows[0];
      console.log(user);
      const matched = await bcrypt.compare(oldPassword, user.password);
      if (matched)
        await updatePassword(
          user._id,
          await bcrypt.hash(newPassword, saltRounds)
        );

      res.json(htttpResp("success", "put", rootPath, { details }));
    } catch (error) {
      res.json(htttpResp("failure", "put", rootPath, { error }));
    }
  }
};
