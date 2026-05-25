const express = require("express"); //imports Express framework for building backend server
const cors = require("cors"); //imports CORS middleware to allow frontend/backend communication

const app = express(); //creates Express application/server
const port = 5050; //backend server will run on port 5050

// allows requests only from React frontend running on localhost:5176
// prevents browser from blocking frontend/backend communication
app.use(cors());

// middleware that converts incoming JSON request bodies into JavaScript objects
// lets us access request data using req.body
app.use(express.json());

// imports all routes from posts.js
const postsRouter = require("./posts");

// all routes in posts.js will start with /posts
// example: router.get("/") becomes GET /posts
app.use("/posts", postsRouter);

// starts backend server and listens for incoming requests on port 5050
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});