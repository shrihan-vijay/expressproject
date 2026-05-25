import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterText, setFilterText] = useState("");
  const [replyText, setReplyText] = useState({});

  const fetchPosts = async () => {
    const response = await axios.get("http://localhost:5050/posts");
    setPosts(response.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !message.trim()) {
      setStatus("Please enter both a username and message.");
      return;
    }

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

    setUsername("");
    setMessage("");
    fetchPosts();
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setUsername(post.username);
    setMessage(post.message);
    setStatus("Editing post.");
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5050/posts/${id}`);
    setStatus("Post deleted.");
    fetchPosts();
  };

  const handleReply = async (postId) => {
    const text = replyText[postId];

    if (!text || !text.trim()) {
      setStatus("Reply cannot be empty.");
      return;
    }

    await axios.post(`http://localhost:5050/posts/${postId}/replies`, {
      username: username || "Anonymous",
      message: text
    });

    setReplyText({ ...replyText, [postId]: "" });
    setStatus("Reply added.");
    fetchPosts();
  };

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

        {filteredPosts.map((post) => (
          <div className="post" key={post.id}>
            <h3>{post.username}</h3>
            <p>{post.message}</p>

            <div className="buttons">
              <button onClick={() => handleEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
            </div>

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