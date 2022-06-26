const express = require("express");
const app = express();
const cors = require("cors");
const httpResp = require("./helpers/htttpResp");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");

const port = process.env.PORT || 5000;

app.disable("x-powered-by");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/signup", signupRouter);
app.use("/login", loginRouter);

// Respond with react
app.get("*", (req, res) => {
  res.send(httpResp("success", "GET", "/", { test: "worked" }));
  //res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(port, async () => {
  console.log(`Starting server on port: ${port}`);
});
