
import { Post, PostStatus } from "../types";

interface PostCardProps {
    post: Post;
    onClick: (postId: string) => void;
    currentUserId: string;
    onUpvote: (postId: string) => void;
    onDownvote: (postId: string) => void;
}

const STATUS_STYLES: Record<PostStatus, { bg: string; color: string; label: string }> = {
    open: { bg: "#EEEDFE", color: "#3C3489", label: "Open" },
    in_review: { bg: "#FAEEDA", color: "#633806", label: "In Review" },
    in_progress: { bg: "#E6F1FB", color: "#0C447C", label: "In Progress" },
    resolved: { bg: "#E1F5EE", color: "#085041", label: "Resolved" },
    closed: { bg: "#F1EFE8", color: "#444441", label: "Closed" },
    rejected: { bg: "#FCEBEB", color: "#791F1F", label: "Rejected" },
};

const PRIORITY_DOT: Record<string, string> = {
    high: "#E24B4A",
    medium: "#EF9F27",
    low: "#639922",
};

export default function PostCard({ post, onClick, onUpvote, onDownvote }: PostCardProps) {
    const status = STATUS_STYLES[post.status] ?? STATUS_STYLES.open;
    const scorePercent = post.validityScoreData
        ? `${(post.validityScoreData.score * 100).toFixed(0)}%`
        : null;

    const handleVote = (e: React.MouseEvent, type: "up" | "down") => {
        e.stopPropagation();
        type === "up" ? onUpvote(post.postId) : onDownvote(post.postId);
    };

    return (
        <div
            onClick={() => onClick(post.postId)}
            style={{
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: 12,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "border-color 0.15s",
                background: "var(--color-background-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-border-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border-secondary)")}
        >
            {/* Top row: status + priority */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, background: status.bg, color: status.color }}>
                    {status.label}
                </span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_DOT[post.priority] ?? "#888", display: "inline-block" }} title={`${post.priority} priority`} />
                <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "capitalize" }}>{post.priority}</span>
                {post.isAnonymous && (
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginLeft: "auto" }}>Anonymous</span>
                )}
            </div>

            {/* Title */}
            <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)", lineHeight: 1.4 }}>
                {post.title}
            </h3>

            {/* Body preview */}
            {post.body && (
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {post.body}
                </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {post.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Bottom row: category + votes + validity */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flex: 1 }}>
                    {post.category}
                </span>

                {/* Vote buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                        onClick={(e) => handleVote(e, "up")}
                        style={{ background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}
                    >
                        ▲ {post.upvotes}
                    </button>
                    <button
                        onClick={(e) => handleVote(e, "down")}
                        style={{ background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}
                    >
                        ▼ {post.downvotes}
                    </button>
                </div>

                {/* Validity score */}
                {scorePercent && (
                    <span style={{ fontSize: 11, color: "#085041", background: "#E1F5EE", padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>
                        {scorePercent} valid
                    </span>
                )}

                <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                    {new Date(post.createdAt).toLocaleDateString("en-IN")}
                </span>
            </div>
        </div>
    );
}