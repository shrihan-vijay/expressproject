const express = require("express");
const router = express.Router();

const db = require("./firebase");

const {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  arrayUnion
} = require("firebase/firestore");

const postsCollection = collection(db, "posts");

router.get("/", async (req, res) => {
  try {
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/recent/hour", async (req, res) => {
  try {
    const oneHourAgo = Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000));

    const q = query(
      postsCollection,
      where("createdAt", ">=", oneHourAgo),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const newPost = {
      username: data.username,
      message: data.message,
      replies: [],
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(postsCollection, newPost);

    res.status(201).json({
      id: docRef.id,
      ...newPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const postRef = doc(db, "posts", id);

    await updateDoc(postRef, {
      username: data.username,
      message: data.message
    });

    res.status(200).json({
      message: "Post updated successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/replies", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const postRef = doc(db, "posts", id);

    const newReply = {
      username: data.username,
      message: data.message,
      createdAt: new Date().toISOString()
    };

    await updateDoc(postRef, {
      replies: arrayUnion(newReply)
    });

    res.status(201).json({
      message: "Reply added successfully",
      reply: newReply
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const postRef = doc(db, "posts", id);

    await deleteDoc(postRef);

    res.status(200).json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;