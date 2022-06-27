const CryptoJS = require("crypto-js");
const { validateToken } = require("../database");
const PASSPHRASE = "test";

const authCheck = async (req, res, next) => {
  const failedAuth = {
    status: "failure",
    data: { error: "You are not authorized to use this route." },
  };
  if (req.get("token")) {
    try {
      const token = decodeToken(req.get("token"));
      const username = req.get("username").toLowerCase();
      const validatedToken = await validateToken(username, token);
      if (validatedToken) {
        const cipher = encodeToken(token);
        res.set("Access-Control-Expose-Headers", "token");
        res.set("token", cipher);
        res.locals.token = token[0];
        res.locals.username = username;
        next();
      } else throw new Error("Validation Failed");
    } catch (err) {
      console.error("AuthError: ", err);
      res.send(failedAuth);
    }
  } else res.send(failedAuth);
};

const encodeToken = (tokenValue) => {
  const val = CryptoJS.AES.encrypt(
    JSON.stringify(tokenValue),
    PASSPHRASE
  ).toString();

  return val;
};

const decodeToken = (tokenValue) => {
  const result = JSON.parse(
    CryptoJS.AES.decrypt(tokenValue, PASSPHRASE).toString(CryptoJS.enc.Utf8)
  );

  return result;
};

module.exports = { authCheck, decodeToken, encodeToken };
