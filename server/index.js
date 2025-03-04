const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  deleteFavorite
} = require("./db");
const express = require('express');
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
    try {
        const users = await fetchUsers();
        res.send(users);
    } catch (ex) {  
        res.status(500).send({ message: ex.message });
        next(ex);
    }
});

app.get("/api/products", async (req, res, next) => {
    try {
        const products = await fetchProducts();
        res.send(products);
    } catch (ex) {
        res.status(500).send({ message: ex.message });
        next(ex);
    }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
    try {
        const favorites = await fetchFavorites(req.params.id);
        res.send(favorites);
    } catch (ex) {
        res.status(500).send({ message: ex.message });
        next(ex);
    }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
    try {
        const favorite = await createFavorite({
            productId: req.body.productId,
            userId: req.params.id
        });
        res.send(favorite);
    } catch (ex) {
        res.status(500).send({ message: ex.message });
        next(ex);
    }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
    try {
        await deleteFavorite(req.params.userId, req.params.id);
        res.sendStatus(204);
    } catch (ex) {
        res.status(500).send({ message: ex.message });
        next(ex);
    }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");
  console.log("Starting to create users and products"); 
  const [Luffy, Zoro, Nami, hat, sword, map, booze] = await Promise.all([
    createUser({
      username: "Luffy",
      password: "meat",
    }),
    createUser({
      username: "Zoro",
      password: "sake",
    }),
    createUser({
      username: "Nami",
      password: "oranges",
    }),
    createProduct({
      name: "hat",
    }),
    createProduct({
      name: "sword",
    }),
    createProduct({
      name: "map",
    }),
    createProduct({
      name: "booze",
    }),
  ]);
  console.log("Finished creating users and products");
  const users = await fetchUsers();
  console.log("users", users);
  const products = await fetchProducts();
  console.log("products", products);
  const [luffyFavorite, zoroFavorite1, namiFavorite, zoroFavorite2] = await Promise.all([
    createFavorite(
      hat.id,
      Luffy.id,
    ),
    createFavorite(
      sword.id,
      Zoro.id,
    ),
    createFavorite(
      map.id,
      Nami.id,
    ),
    createFavorite(
      booze.id,
      Zoro.id,
    ),
  ]);
  console.log("seeded favorites");
  const favorites = await fetchFavorites(Zoro.id);
  console.log("favorites", favorites);
  await deleteFavorite(Zoro.id, zoroFavorite2.id);
  console.log("deleted favorite");
  const newFavorites = await fetchFavorites(Zoro.id);
  console.log("new favorites", newFavorites);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("some curl commands to test");
    console.log(`curl -X GET http://localhost:${port}/api/users`);
    console.log(`curl -X GET http://localhost:${port}/api/products`);
    console.log(`curl -X GET http://localhost:${port}/api/users/${Luffy.id}/favorites`);
    console.log(`curl -X POST http://localhost:${port}/api/users/${Luffy.id}/favorites -d '{"productId": "${map.id}"}' -H 'Content-Type: application/json'`);
    console.log(`curl -X DELETE http://localhost:${port}/api/users/${Zoro.id}/favorites/${newFavorites[0].id}`);
  });
};

init();
