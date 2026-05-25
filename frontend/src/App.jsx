import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // React state stores data that can change and cause the UI to re-render
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterText, setFilterText] = useState("");
  const [replyText, setReplyText] = useState({});

  // Gets all posts from backend route GET /posts
  // Backend then gets the data from Firebase
  const fetchPosts = async () => {
    const response = await axios.get("http://localhost:5050/posts");
    setPosts(response.data);
  };

  // Runs once when the page first loads
  // This makes the app show posts already stored in Firebase
  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Makes sure user does not submit empty inputs
    if (!username.trim() || !message.trim()) {
      setStatus("Please enter both a username and message.");
      return;
    }

    // If editingId exists, update an existing post
    // Otherwise, create a new post
    if (editingId) {
      await axios.put(`http://localhost:5050/posts/${editingId}`, {
        username,
        message
      });

      setEditingId(null);
      setStatus("Post updated.");
    } else {
      await axios.post("http://localhost:5050/posts", {
        username,
        message
      });

      setStatus("Post created.");
    }

    // Clears form and reloads posts so frontend matches Firebase
    setUsername("");
    setMessage("");
    fetchPosts();
  };

  // Puts the selected post data into the form
  // Also stores the post id so submit knows to update instead of create
  const handleEdit = (post) => {
    setEditingId(post.id);
    setUsername(post.username);
    setMessage(post.message);
    setStatus("Editing post.");
  };

  // Sends DELETE /posts/:id to backend
  // Backend deletes that document from Firebase
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5050/posts/${id}`);
    setStatus("Post deleted.");
    fetchPosts();
  };

  const handleReply = async (postId) => {
    const text = replyText[postId];

    // Prevents empty replies
    if (!text || !text.trim()) {
      setStatus("Reply cannot be empty.");
      return;
    }

    // Sends reply to backend route POST /posts/:id/replies
    // Backend adds reply to the replies array in Firebase
    await axios.post(`http://localhost:5050/posts/${postId}/replies`, {
      username: username || "Anonymous",
      message: text
    });

    // Clears only the reply box for this specific post
    setReplyText({ ...replyText, [postId]: "" });
    setStatus("Reply added.");
    fetchPosts();
  };

  // Creates the list of posts that should actually be displayed
  // First filters by search text, then sorts by createdAt time
  const filteredPosts = posts
    .filter((post) => {
      const search = filterText.toLowerCase();
      return (
        post.username?.toLowerCase().includes(search) ||
        post.message?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;

      if (sortOrder === "newest") {
        return timeB - timeA;
      }

      return timeA - timeB;
    });

  return (
    <div className="page">
      <div className="card">
        <h1>Message Board</h1>

        {/* Form is used for both creating and updating posts */}
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">
            {editingId ? "Update Post" : "Create Post"}
          </button>
        </form>

        {status && <p className="status">{status}</p>}

        {/* Controls for filtering and sorting posts on the frontend */}
        <div className="controls">
          <input
            placeholder="Filter posts..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <h2>All Posts</h2>

        {/* Displays each post from the filtered/sorted posts array */}
        {filteredPosts.map((post) => (
          <div className="post" key={post.id}>
            <h3>{post.username}</h3>
            <p>{post.message}</p>

            <div className="buttons">
              <button onClick={() => handleEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
            </div>

            {/* Each post has its own reply input stored by post id */}
            <div className="replyBox">
              <input
                placeholder="Write a reply..."
                value={replyText[post.id] || ""}
                onChange={(e) =>
                  setReplyText({ ...replyText, [post.id]: e.target.value })
                }
              />
              <button onClick={() => handleReply(post.id)}>Reply</button>
            </div>

            {/* Only display replies if the post has replies */}
            {post.replies && post.replies.length > 0 && (
              <div className="replies">
                <h4>Replies</h4>
                {post.replies.map((reply, index) => (
                  <div className="reply" key={index}>
                    <strong>{reply.username}</strong>: {reply.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;