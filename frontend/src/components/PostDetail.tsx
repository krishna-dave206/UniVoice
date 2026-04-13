import { useState, useEffect } from "react";
import type { Post, PostStatus, Comment, ValidityScore } from "../types";
import { postsApi, commentsApi, normaliseDoc } from "../services/api";
import CommentThread from "./CommentThread";

interface PostDetailProps {
  postId: string;
  currentUserId: string;
  onBack: () => void;
}

const STATUS_STYLES: Record<PostStatus, { bg: string; color: string; label: string }> = {
  open:        { bg: "#EEEDFE", color: "#3C3489", label: "Open" },
  in_review:   { bg: "#FAEEDA", color: "#633806", label: "In Review" },
  in_progress: { bg: "#E6F1FB", color: "#0C447C", label: "In Progress" },
  resolved:    { bg: "#E1F5EE", color: "#085041", label: "Resolved" },
  closed:      { bg: "#F1EFE8", color: "#444441", label: "Closed" },
  rejected:    { bg: "#FCEBEB", color: "#791F1F", label: "Rejected" },
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   "#E24B4A",
  medium: "#EF9F27",
  low:    "#639922",
};

export function PostDetail({ postId, currentUserId, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [vs, setVs] = useState<ValidityScore | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voting, setVoting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    setError("");
    const res = await postsApi.getById(postId);
    if (res.success && res.data) {
      const raw = res.data as Record<string, unknown>;
      setPost(normaliseDoc(raw, "postId") as unknown as Post);
      if (raw.validityScoreData) setVs(raw.validityScoreData as ValidityScore);
    } else {
      setError(res.message ?? "Failed to load post");
    }
    setLoading(false);
  };

  const loadComments = async () => {
    const res = await commentsApi.getByPost(postId);
    if (res.success && Array.isArray(res.data)) {
      setComments(
        (res.data as Record<string, unknown>[]).map((c) =>
          normaliseDoc(c, "commentId") as unknown as Comment
        )
      );
    }
  };

  const handleVote = async (type: "upvote" | "downvote") => {
    if (voting || !post) return;
    setVoting(true);
    const fn = type === "upvote" ? postsApi.upvote : postsApi.downvote;
    const res = await fn(post._id ?? post.postId, currentUserId);
    if (res.success && res.data) {
      const d = res.data as Record<string, unknown>;
      if (d.post) setPost((prev) => prev ? { ...prev, ...(d.post as Partial<Post>) } : prev);
      if (d.validityScore) setVs(d.validityScore as ValidityScore);
    }
    setVoting(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    setSubmittingComment(true);
    const res = await commentsApi.add({
      complaintId: post._id ?? post.postId,
      userId: currentUserId,
      body: newComment,
    });
    if (res.success && res.data) {
      const c = normaliseDoc(res.data as Record<string, unknown>, "commentId") as unknown as Comment;
      setComments((prev) => [...prev, c]);
      setNewComment("");
    }
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const res = await commentsApi.delete(commentId, currentUserId);
    if (res.success) setComments((prev) => prev.filter((c) => c._id !== commentId && c.commentId !== commentId));
  };

  if (loading) {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost" style={{ marginBottom: 24 }}>
          ← Back
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="skeleton" style={{ height: 36, width: "60%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 18, width: "30%", borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 10 }} />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost" style={{ marginBottom: 24 }}>← Back</button>
        <div className="alert alert-error">{error || "Post not found."}</div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[post.status] ?? STATUS_STYLES.open;
  const scorePercent = vs ? `${(vs.score * 100).toFixed(0)}%` : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Back button */}
      <button onClick={onBack} className="btn-ghost" style={{ marginBottom: 24 }}>
        ← Back to posts
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        {/* Status + Priority row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
              background: statusStyle.bg, color: statusStyle.color,
            }}
          >
            {statusStyle.label}
          </span>
          <span
            style={{
              fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
              background: PRIORITY_COLOR[post.priority] + "18",
              color: PRIORITY_COLOR[post.priority],
              textTransform: "capitalize",
            }}
          >
            {post.priority} priority
          </span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: "auto" }}>
            {new Date(post.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.4, color: "var(--text-primary)" }}>
          {post.title}
        </h1>

        {/* Meta: category / anonymous */}
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)", marginBottom: post.body ? 16 : 8 }}>
          <span>📂 {post.category}</span>
          {post.isAnonymous && <span>👤 Anonymous</span>}
        </div>

        {/* Body */}
        {post.body && (
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-primary)", margin: "0 0 16px", whiteSpace: "pre-wrap" }}>
            {post.body}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            {post.tags.map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Votes + Validity Score */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => handleVote("upvote")}
            disabled={voting}
            className="vote-btn vote-up"
          >
            ▲ {post.upvotes}
          </button>
          <button
            onClick={() => handleVote("downvote")}
            disabled={voting}
            className="vote-btn vote-down"
          >
            ▼ {post.downvotes}
          </button>

          {scorePercent && (
            <span
              style={{
                marginLeft: "auto", fontSize: 12, fontWeight: 500,
                padding: "4px 10px", borderRadius: 20,
                background: "#E1F5EE", color: "#085041",
              }}
            >
              {scorePercent} validity
            </span>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="card">
        <CommentThread
          postId={post._id ?? post.postId}
          currentUserId={currentUserId}
          comments={comments}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          submitting={submitingComment}
        />
      </div>
    </div>
  );
}

export default PostDetail;
