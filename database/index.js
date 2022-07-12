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
        console.error(e);
        reject(e);
      }
    } finally {
      client.release();
    }
  });
};

const __allToLowerCase = (str) => str.toLowerCase();
const __pascalCase = (str) =>
  str
    .split(" ")
    .map((val) => val[0].toUpperCase() + val.slice(1))
    .join(" ");

// User table

module.exports.createUser = async (username, password, email) => {
  return new Promise(async (resolve, reject) => {
    const sql =
      "INSERT INTO users(username, password, email) VALUES($1, $2, $3)";
    const values = [
      __allToLowerCase(username),
      password,
      __allToLowerCase(email),
    ];
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
    const values = [__allToLowerCase(username)];
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
    const values = [__allToLowerCase(email), id];
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
    const values = [token[2], token[0], __allToLowerCase(username)];
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

// Grocery Lists

module.exports.createGroceryList = async (name, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql =
        "INSERT INTO grocery_list(name, user_id, date) VALUES($1, $2, $3) RETURNING _id";
      const values = [__allToLowerCase(name), userId, Date.now()];
      const resp = await __sqlQuery(sql, values);
      const newListId = resp.rows[0]["_id"];
      resolve(newListId);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.deleteGroceryList = async (id, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = "DELETE FROM grocery_list WHERE user_id=$1 AND _id=$2";
      const values = [userId, id];
      const resp = await __sqlQuery(sql, values);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.getListsById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = "SELECT _id, name, date FROM grocery_list WHERE user_id=$1";
      const values = [userId];
      const resp = await __sqlQuery(sql, values);
      resolve(resp.rows);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};

module.exports.getListById = (userId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql =
        "SELECT _id, name, date FROM grocery_list WHERE user_id=$1 AND _id=$2";
      const values = [userId, id];
      const resp = await __sqlQuery(sql, values);
      const sql2 =
        "SELECT l._id, g.name, l.selected FROM list_item l INNER JOIN grocery_item g ON l.item_id=g._id WHERE list_id=$1";
      const values2 = [id];
      const resp2 = await __sqlQuery(sql2, values2);
      resolve([resp.rows[0], resp2.rows]);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.addItemToList = (listId, item) => {
  return new Promise(async (resolve, reject) => {
    try {
      const itemId = await __getItemId(item);
      const sql = "INSERT INTO list_item(list_id, item_id) VALUES($1,$2)";
      const values = [listId, itemId];
      const resp = await __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};

// Get item ID, create item if does not exist
const __getItemId = (item) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = "SELECT * FROM grocery_item WHERE name=$1";
      const values = [item];
      const resp = await __sqlQuery(sql, values);
      if (resp.rowCount === 0) throw new Error("new item");
      resolve(resp.rows[0]._id);
    } catch (e) {
      if (e.message !== "new item") return reject(e);
      const sql = "INSERT INTO grocery_item(name) VALUES($1) RETURNING _id";
      const values = [item];
      const resp = await __sqlQuery(sql, values);
      resolve(resp.rows[0]._id);
    }
  });
};

module.exports.removeItemFromList = (listId, item) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = "DELETE FROM list_item WHERE list_id=$1 AND _id=$2";
      const values = [listId, item._id];
      const resp = await __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.setItemSelectedStatus = (listId, item, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql =
        "UPDATE list_item SET selected=$1 WHERE list_id=$2 AND _id=$3";
      const values = [status, listId, item._id];
      const resp = await __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.getItems = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = "SELECT * FROM grocery_item WHERE name ILIKE $1";
      const values = ["%" + filter + "%"];
      const resp = await __sqlQuery(sql, values);
      resolve(resp);
    } catch (e) {
      reject(e);
    }
  });
};
