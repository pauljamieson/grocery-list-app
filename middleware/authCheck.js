const CryptoJS = require("crypto-js");
const { validateUserToken } = require("../database");
const PASSPHRASE = "test";

const authCheck = async (req, res, next) => {
  const failedAuth = {
    status: "failure",
    data: { error: "You are not authorized to use this route." },
  };
  if (req.get("token")) {
    try {
      const token = decodeToken(req.get("token"));
      const validatedToken = await validateUserToken(
        req.get("username"),
        token
      );
      if (validatedToken) {
        const cipher = encodeToken(validatedToken);
        res.set("Access-Control-Expose-Headers", "token");
        res.set("token", cipher);
        res.locals.username = req.get("username");
        next();
      } else throw new Error("Validation Failed");
    } catch (err) {
      res.send(failedAuth);
    }
  } else res.send(failedAuth);
};

const encodeToken = (tokenValue) =>
  CryptoJS.AES.encrypt(JSON.stringify(tokenValue), PASSPHRASE).toString();

const decodeToken = (tokenValue) =>
  JSON.parse(
    CryptoJS.AES.decrypt(tokenValue, PASSPHRASE).toString(CryptoJS.enc.Utf8)
  );

module.exports = { authCheck, decodeToken, encodeToken };
