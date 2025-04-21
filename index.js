// index.js (Backend con Google Custom Search)
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Reemplaza estos con tus propias credenciales
const GOOGLE_API_KEY = "AIzaSyAK4mxMDuqSGHPuId6wYMfC78i4dNQOzhs";
const GOOGLE_CX = "d015304a547014221";

// GET /search-google?q=lo que busquemos
app.get("/search-google", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Falta el parámetro ?q=" });
    }

    // Endpoint oficial de la Custom Search JSON API
    const url = "https://www.googleapis.com/customsearch/v1";
    const params = {
      key: "AIzaSyAK4mxMDuqSGHPuId6wYMfC78i4dNQOzhs",
      cx: "d015304a547014221",
      q, // la consulta de búsqueda
    };

    const { data } = await axios.get(url, { params });
    // `data.items` contiene los resultados, cada uno con title, link, snippet, etc.
    if (!data.items) {
      return res.json([]);
    }

    // Normalizamos la data para que tu frontend reciba { title, link, snippet }
    const results = data.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    res.json(results);
  } catch (error) {
    console.error("Error en /search-google:", error);
    res
      .status(500)
      .json({ error: "Ocurrió un error en la búsqueda de Google." });
  }
});

// ---------- EJEMPLO de favoritos en memoria ----------
let favorites = [];

// GET /favorites
app.get("/favorites", (req, res) => {
  res.json(favorites);
});

// POST /favorites  ( body: { item: {...} } )
app.post("/favorites", (req, res) => {
  const { item } = req.body;
  if (!item) {
    return res.status(400).json({ error: "Falta 'item' en el body." });
  }
  favorites.push(item);
  return res.status(201).json({ message: "Favorito agregado", item });
});

// DELETE /favorites?link=...
app.delete("/favorites", (req, res) => {
  const { link } = req.query;
  favorites = favorites.filter((fav) => fav.link !== link);
  return res.json({ message: "Favorito eliminado", linkEliminado: link });
});

// Levantamos el servidor
app.listen(3001, () => {
  console.log("Servidor escuchando en http://localhost:3001");
});
