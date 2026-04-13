import type { Comment } from "../types";

interface CommentThreadProps {
  postId: string;
  currentUserId: string;
  comments: Comment[];
  newComment: string;
  onNewCommentChange: (v: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (id: string) => void;
  submitting: boolean;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function CommentThread({
  currentUserId,
  comments,
  newComment,
  onNewCommentChange,
  onAddComment,
  onDeleteComment,
  submitting,
}: CommentThreadProps) {
  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, margin: "0 0 16px" }}>
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="subtle-text" style={{ marginBottom: 20 }}>
          No comments yet. Be the first to respond.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {comments.map((comment) => {
            const cId = comment._id ?? comment.commentId;
            const isOwner = comment.userId === currentUserId;
            return (
              <div
                key={cId}
                style={{
                  padding: "12px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: isOwner ? "var(--surface-hover)" : "var(--surface)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                    {isOwner ? "You" : `User ${comment.userId.slice(-6)}`}
                  </span>
                  <span className="subtle-text" style={{ fontSize: 11 }}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: 13, margin: 0, color: "var(--text-primary)", lineHeight: 1.65 }}>
                  {comment.body}
                </p>
                {isOwner && (
                  <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                    <button
                      onClick={() => onDeleteComment(cId)}
                      style={{
                        fontSize: 11, color: "#A32D2D", background: "none",
                        border: "none", cursor: "pointer", padding: 0,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={onAddComment}>
        <textarea
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "1px solid var(--border)", fontSize: 13,
            resize: "vertical", boxSizing: "border-box",
            background: "var(--surface)", color: "var(--text-primary)",
          }}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="btn-primary"
          style={{ marginTop: 8 }}
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>
    </div>
  );
}