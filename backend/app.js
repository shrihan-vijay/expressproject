const express = require("express");
const cors = require("cors");

const app = express();
const port = 5050;

app.use(cors({
  origin: "http://localhost:5176"
}));

app.use(express.json());

const postsRouter = require("./posts");

app.use("/posts", postsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});