const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://postgres@localhost/acme_store"
);
const uuid = require("uuid");
const bcrypt = require('bcrypt');

const createTables = async () => {
  try {
    const SQL = `
            DROP TABLE IF EXISTS favorites;
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS products;
            CREATE TABLE users(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
            CREATE TABLE products(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT UNIQUE NOT NULL
            );
            CREATE TABLE favorites(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID REFERENCES products(id),
                user_id UUID REFERENCES users(id),
                CONSTRAINT unique_favorite UNIQUE (product_id, user_id)
            );
        `;
    await client.query(SQL);
  } catch (ex) {
    console.log(ex);
  }
};

const createUser = async ({ username, password }) => {
  try {
    const SQL = `
            INSERT INTO users(id, username, password) values($1, $2, $3) returning *;
        `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
  } catch (ex) {
    console.log(ex);
  }
};

const createProduct = async ({ name }) => {
  try {
    const SQL = `
            INSERT INTO products(id, name) values($1, $2) returning *;
        `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
  } catch (ex) {
    console.log("Error in createProduct:", ex);
  }
};

const fetchUsers = async () => {
  try {
    const SQL = `
            SELECT * FROM users;
        `;
    const response = await client.query(SQL);
    return response.rows;
  } catch (ex) {
    console.log(ex);
  }
};

const fetchProducts = async () => {
  try {
    const SQL = `
            SELECT * FROM products;
        `;
    const response = await client.query(SQL);
    return response.rows;
  } catch (ex) {
    console.log(ex);
  }
};

const createFavorite = async ( productId, userId ) => {
    try {
        const SQL = `
                INSERT INTO favorites(id, product_id, user_id) values($1, $2, $3) returning *;
            `;
        const response = await client.query(SQL, [uuid.v4(), productId, userId]);
        return response.rows[0];
    } catch (ex) {
        console.log(ex);
    }
};

const fetchFavorites = async (id) => {
    try {
        const SQL = `
                SELECT * FROM favorites WHERE user_id = $1;
            `;
        const response = await client.query(SQL, [id]);
        return response.rows;
    } catch (ex) {
        console.log(ex);
    }
};

const deleteFavorite = async (userId, id) => {
    try {
        const SQL = `
                DELETE FROM favorites WHERE user_id = $1 AND id = $2;
            `;
        await client.query(SQL, [userId, id]);
    } catch (ex) {
        console.log(ex);
    }
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  deleteFavorite
};
