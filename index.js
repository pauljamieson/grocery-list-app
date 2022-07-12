const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const apiRouter = require("./routes/api");

const port = process.env.PORT || 5000;

app.disable("x-powered-by");

// Make react app build path available
app.use(express.static(path.join(__dirname, "build")));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("Path:", req.method, req.path);
  next();
});

// API routes
app.use("/api", apiRouter);

// Respond with react
app.get("/", (req, res) => {  
  res.sendFile(path.join(__dirname, "build/index.html"));
});

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, async () => {
  console.log(`Starting server on port: ${port}`);
});
