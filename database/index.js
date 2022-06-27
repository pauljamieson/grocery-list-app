const { mode } = require("crypto-js");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const pool = new Pool();

const __sqlQuery = async (sql, values) => {
  return new Promise(async (resolve, reject) => {
    try {
      var client = await pool.connect();
      const resp = await client.query(sql, values);
      resolve(resp);
    } catch (e) {
      if (e.severity === "ERROR" && e.code === "23505") {
        reject("DUPLICATE");
      } else {
        console.log(e);
        reject(e);
      }
    } finally {
      client.release();
    }
  });
};

// User table

module.exports.createUser = async (username, password, email) => {
  return new Promise(async (resolve, reject) => {
    const sql =
      "INSERT INTO users(username, password, email) VALUES($1, $2, $3)";
    const values = [username, password, email];
    try {
      const resp = await __sqlQuery(sql, values);
      if (resp.rowCount !== 1) throw "Failed to create user.";
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.readUser = async (username) => {
  return new Promise(async (resolve, reject) => {
    const sql = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    try {
      const resp = await __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.updatePassword = async (id, password) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET password=$1 WHERE _id=$2";
    const values = [password, id];
    try {
      const resp = __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.updateEmail = async (id, email) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET email=$1 WHERE _id=$2";
    const values = [email, id];
    try {
      const resp = __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};

// tokens table

module.exports.createToken = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const weekFromToday = new Date().setDate(new Date().getDate() + 7);
    const tokenValue = uuidv4();
    const sql =
      "INSERT INTO tokens(value, expires, user_id) VALUES($1, $2, $3)";
    const values = [tokenValue, weekFromToday, userId];
    try {
      const resp = await __sqlQuery(sql, values);
      if (resp.rowCount !== 1) throw "Failed to create login token.";
      resolve(values);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.validateToken = async (username, token) => {
  return new Promise(async (resolve, reject) => {
    const sql =
      "SELECT * FROM tokens WHERE user_id=$1 and value=$2 and user_id=(select _id FROM users WHERE username=$3)";
    const values = [token[2], token[0], username];
    try {
      const resp = await __sqlQuery(sql, values);
      if (resp.rowCount !== 1) throw "Failed to validate token.";
      resolve(true);
    } catch (e) {
      console.error(e);
      reject(false);
    }
  });
};

module.exports.deleteToken = async (token) => {
  return new Promise(async (resolve, reject) => {
    const sql = "DELETE FROM tokens WHERE value=$1";
    const values = [token];
    try {
      const resp = await __sqlQuery(sql, values);
      if (resp.rowCount < 1) throw "Failed to delete login token.";
      resolve(true);
    } catch (e) {
      console.error(e);
      reject(false);
    }
  });
};
