import { useState, useEffect } from "react";
import type { Post } from "../types";
import PostCard from "./PostCard";
import { postsApi, normaliseDoc } from "../services/api";

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
    const params: Record<string, string> = {};
    if (category !== "All") params.category = category;
    if (status) params.status = status;
    const res = await postsApi.getAll(params);
    if (res.success && Array.isArray(res.data)) {
      setPosts(
        (res.data as Record<string, unknown>[]).map((p) =>
          normaliseDoc(p, "postId") as unknown as Post
        )
      );
    }
    setLoading(false);
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    const fn = type === "upvote" ? postsApi.upvote : postsApi.downvote;
    const res = await fn(postId, currentUserId);
    if (res.success && res.data) {
      const updated = (res.data as Record<string, unknown>).post as Record<string, unknown>;
      if (updated) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId || p.postId === postId
              ? { ...p, ...(normaliseDoc(updated, "postId") as unknown as Post) }
              : p
          )
        );
      }
    }
  };

  const filtered = posts.filter((p) =>
    search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.body?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div>
      {/* Search + filters */}
      <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid var(--border)", fontSize: 14, boxSizing: "border-box",
            background: "var(--surface)", color: "var(--text-primary)",
          }}
        />

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={category === cat ? "chip chip-active" : "chip"}
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
              className={status === s.value ? "chip-sm chip-sm-active" : "chip-sm"}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post count */}
      <p className="subtle-text" style={{ marginBottom: 14 }}>
        {loading ? "Loading..." : `${filtered.length} post${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* Feed */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No posts found</p>
          <p className="subtle-text">Try adjusting the filters or create a new post.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((post) => (
            <PostCard
              key={post._id ?? post.postId}
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