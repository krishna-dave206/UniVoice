import type { Post, PostStatus } from "../types";

interface PostCardProps {
  post: Post;
  onClick: (postId: string) => void;
  currentUserId: string;
  onUpvote: (postId: string) => void;
  onDownvote: (postId: string) => void;
}

const STATUS_STYLES: Record<PostStatus, { bg: string; color: string; label: string }> = {
  open:        { bg: "#e0e7ff", color: "#4f46e5", label: "Open" }, // Soft purple/indigo
  in_review:   { bg: "#fef3c7", color: "#d97706", label: "In Review" },
  in_progress: { bg: "#dbeafe", color: "#2563eb", label: "In Progress" },
  resolved:    { bg: "#dcfce7", color: "#16a34a", label: "Resolved" },
  closed:      { bg: "#f3f4f6", color: "#4b5563", label: "Closed" },
  rejected:    { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
};

const PRIORITY_DOT: Record<string, string> = {
  high:   "#ef4444", // Red dot for high
  medium: "#f59e0b",
  low:    "#10b981",
};

export default function PostCard({ post, onClick, onUpvote, onDownvote }: PostCardProps) {
  // Support both _id (MongoDB) and postId (aliased) as identifier
  const pid = post._id ?? post.postId;
  const status = STATUS_STYLES[post.status] ?? STATUS_STYLES.open;
  const scorePercent = post.validityScoreData
    ? `${(post.validityScoreData.score * 100).toFixed(0)}%`
    : null;

  const handleVote = (e: React.MouseEvent, type: "up" | "down") => {
    e.stopPropagation();
    type === "up" ? onUpvote(pid) : onDownvote(pid);
  };

  return (
    <div
      onClick={() => onClick(pid)}
      className="post-card"
    >
      {/* Top row: status + priority */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
            background: status.bg, color: status.color,
          }}
        >
          {status.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: PRIORITY_DOT[post.priority] ?? "#888",
              display: "inline-block",
            }}
            title={`${post.priority} priority`}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
            {post.priority}
          </span>
        </div>
        {post.isAnonymous && (
          <span style={{ fontSize: 13, color: "var(--text-light)", marginLeft: "auto" }}>Anonymous</span>
        )}
      </div>

      {/* Title */}
      <h3 className="post-card-title">
        {post.title}
      </h3>

      {/* Body preview */}
      {post.body && (
        <p
          className="post-card-desc"
          style={{
            margin: "0 0 16px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {post.body}
        </p>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {post.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, marginTop: "auto", borderTop: "1px solid var(--surface-border)" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", flex: 1 }}>
          {post.category}
        </span>

        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={(e) => handleVote(e, "up")} className="vote-btn vote-up">
            ▲ {post.upvotes}
          </button>
          <button onClick={(e) => handleVote(e, "down")} className="vote-btn vote-down">
            ▼ {post.downvotes}
          </button>
        </div>

        {scorePercent && (
          <span style={{ fontSize: 11, color: "#085041", background: "#E1F5EE", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
            {scorePercent} valid
          </span>
        )}

        <span style={{ fontSize: 12, color: "var(--text-light)" }}>
          {new Date(post.createdAt).toLocaleDateString("en-IN")}
        </span>
      </div>
    </div>
  );
}