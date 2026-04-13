import type { Post, PostStatus } from "../types";

interface PostCardProps {
  post: Post;
  onClick: (postId: string) => void;
  currentUserId: string;
  onUpvote: (postId: string) => void;
  onDownvote: (postId: string) => void;
}

const STATUS_STYLES: Record<PostStatus, { bg: string; color: string; label: string }> = {
  open:        { bg: "#EEEDFE", color: "#3C3489", label: "Open" },
  in_review:   { bg: "#FAEEDA", color: "#633806", label: "In Review" },
  in_progress: { bg: "#E6F1FB", color: "#0C447C", label: "In Progress" },
  resolved:    { bg: "#E1F5EE", color: "#085041", label: "Resolved" },
  closed:      { bg: "#F1EFE8", color: "#444441", label: "Closed" },
  rejected:    { bg: "#FCEBEB", color: "#791F1F", label: "Rejected" },
};

const PRIORITY_DOT: Record<string, string> = {
  high:   "#E24B4A",
  medium: "#EF9F27",
  low:    "#639922",
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
            background: status.bg, color: status.color,
          }}
        >
          {status.label}
        </span>
        <span
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: PRIORITY_DOT[post.priority] ?? "#888",
            display: "inline-block",
          }}
          title={`${post.priority} priority`}
        />
        <span className="subtle-text" style={{ fontSize: 11, textTransform: "capitalize" }}>
          {post.priority}
        </span>
        {post.isAnonymous && (
          <span className="subtle-text" style={{ fontSize: 11, marginLeft: "auto" }}>Anonymous</span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px", color: "var(--text-primary)", lineHeight: 1.4 }}>
        {post.title}
      </h3>

      {/* Body preview */}
      {post.body && (
        <p
          className="subtle-text"
          style={{
            fontSize: 13, margin: "0 0 12px", lineHeight: 1.65,
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <span className="subtle-text" style={{ fontSize: 12, flex: 1 }}>
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

        <span className="subtle-text" style={{ fontSize: 11 }}>
          {new Date(post.createdAt).toLocaleDateString("en-IN")}
        </span>
      </div>
    </div>
  );
}