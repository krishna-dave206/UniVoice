
import { useState, useEffect } from "react";
import { Post, PostStatus } from "../types";
import PostCard from "./PostCard";

interface PostFeedProps {
  onPostClick: (postId: string) => void;
  currentUserId: string;
}

const CATEGORIES = ["All", "Infrastructure", "Academic", "Hostel", "Library", "Transport", "Other"];
const STATUSES: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "In Review", value: "in_review" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

export default function PostFeed({ onPostClick, currentUserId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [category, status]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (status) params.set("status", status);

      const res = await fetch(`http://localhost:3000/api/posts?${params}`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.map((p) => p.postId === postId ? { ...p, ...data.data.post } : p));
      }
    } catch {}
  };

  const filtered = posts.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.body?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div>
      {/* Search + filters */}
      <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 14, boxSizing: "border-box" }}
        />

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "0.5px solid",
                background: category === cat ? "#534AB7" : "transparent",
                color: category === cat ? "#fff" : "var(--color-text-secondary)",
                borderColor: category === cat ? "#534AB7" : "var(--color-border-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", border: "0.5px solid",
                background: status === s.value ? "var(--color-background-secondary)" : "transparent",
                color: "var(--color-text-secondary)",
                borderColor: status === s.value ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
                fontWeight: status === s.value ? 500 : 400,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post count */}
      <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 14 }}>
        {loading ? "Loading..." : `${filtered.length} post${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* Feed */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 120, borderRadius: 12, background: "var(--color-background-secondary)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-secondary)" }}>
          <p style={{ fontSize: 15 }}>No posts found.</p>
          <p style={{ fontSize: 13 }}>Try adjusting the filters or create a new post.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              onClick={onPostClick}
              currentUserId={currentUserId}
              onUpvote={(id) => handleVote(id, "upvote")}
              onDownvote={(id) => handleVote(id, "downvote")}
            />
          ))}
        </div>
      )}
    </div>
  );
}