const express = require("express"); //imports Express so we can create routes
const router = express.Router(); //creates a router to organize post-related backend routes

const db = require("./firebase"); //imports Firestore database connection from firebase.js

// imports Firestore functions used to read, create, update, delete, filter, and sort data
const {
  collection, //points to a Firestore collection
  getDocs, //gets multiple documents from Firestore
  addDoc, //adds a new document to a collection
  doc, //points to one specific document
  updateDoc, //updates an existing document
  deleteDoc, //deletes an existing document
  query, //creates a custom database query
  where, //filters documents based on a condition
  Timestamp, //creates Firebase timestamp values
  orderBy, //sorts query results
  arrayUnion //adds an item to an array field without replacing the whole array
} = require("firebase/firestore");

// points to the "posts" collection in Firestore
// this is where all post documents are stored
const postsCollection = collection(db, "posts");

// handles GET /posts
// gets all posts from Firestore and sends them to the frontend
router.get("/", async (req, res) => {
  try {
    const q = query(postsCollection, orderBy("createdAt", "desc")); //creates query to get posts newest first
    const snapshot = await getDocs(q); //runs query and gets matching documents from Firestore

    const posts = snapshot.docs.map((doc) => ({ //converts Firebase documents into normal JS objects
      id: doc.id, //adds the Firebase document id
      ...doc.data() //adds all fields from the document
    }));

    res.status(200).json(posts); //sends posts back to frontend as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); //sends error response if something fails
  }
});

// handles GET /posts/recent/hour
// gets only posts created within the last hour
router.get("/recent/hour", async (req, res) => {
  try {
    const oneHourAgo = Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000)); //creates timestamp for one hour ago

    const q = query(
      postsCollection, //searches inside posts collection
      where("createdAt", ">=", oneHourAgo), //only gets posts created within the last hour
      orderBy("createdAt", "desc") //sorts newest first
    );

    const snapshot = await getDocs(q); //runs query and gets matching documents

    const posts = snapshot.docs.map((doc) => ({ //converts Firebase documents into normal JS objects
      id: doc.id, //adds document id
      ...doc.data() //adds document fields
    }));

    res.status(200).json(posts); //sends recent posts back to frontend
  } catch (error) {
    res.status(500).json({ error: error.message }); //sends error response if something fails
  }
});

// handles POST /posts
// creates a new post in Firestore
router.post("/", async (req, res) => {
  try {
    const data = req.body; //gets username and message sent from frontend

    const newPost = {
      username: data.username, //stores username from request body
      message: data.message, //stores message from request body
      replies: [], //starts each new post with no replies
      createdAt: Timestamp.now() //stores current time as Firebase timestamp
    };

    const docRef = await addDoc(postsCollection, newPost); //adds new post document to posts collection

    res.status(201).json({
      id: docRef.id, //returns new Firebase document id
      ...newPost //returns the post data that was saved
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); //sends error response if something fails
  }
});

// handles PUT /posts/:id
// updates an existing post by its document id
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id; //gets post id from URL
    const data = req.body; //gets updated username and message from frontend

    const postRef = doc(db, "posts", id); //points to the specific post document in Firestore

    await updateDoc(postRef, {
      username: data.username, //updates username field
      message: data.message //updates message field
    });

    res.status(200).json({
      message: "Post updated successfully" //sends success message back to frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); //sends error response if something fails
  }
});

// handles POST /posts/:id/replies
// adds a reply to an existing post
router.post("/:id/replies", async (req, res) => {
  try {
    const id = req.params.id; //gets parent post id from URL
    const data = req.body; //gets reply username and message from frontend

    const postRef = doc(db, "posts", id); //points to the post document that should receive the reply

    const newReply = {
      username: data.username, //stores reply username
      message: data.message, //stores reply message
      createdAt: new Date().toISOString() //stores reply creation time as string
    };

    await updateDoc(postRef, {
      replies: arrayUnion(newReply) //adds new reply to replies array without deleting old replies
    });

    res.status(201).json({
      message: "Reply added successfully", //sends success message
      reply: newReply //sends added reply back to frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); //sends error response if something fails
  }
});

// handles DELETE /posts/:id
// deletes an existing post by its document id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id; //gets post id from URL
    const postRef = doc(db, "posts", id); //points to the specific post document

    await deleteDoc(postRef); //deletes the post document from Firestore

    res.status(200).json({
      message: "Post deleted successfully" //sends success message back to frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); //sends error response if something fails
  }
});

module.exports = router; //exports router so app.js can use these routes under /posts