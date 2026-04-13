import { useState } from "react";
import type { PostPriority } from "../types";
import { postsApi } from "../services/api";

interface PostFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const CATEGORIES = ["Infrastructure", "Academic", "Hostel", "Library", "Transport", "Other"];

export default function PostForm({ userId, onSuccess, onCancel }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<PostPriority>("medium");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 5) setTags((prev) => [...prev, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Title is required");
    if (!category) return setError("Please select a category");

    setLoading(true);
    try {
      const data = await postsApi.create({ userId, title, body, category, priority, tags, isAnonymous });
      if (!data.success) { setError(data.message ?? "Failed to create post"); return; }
      onSuccess();
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border)", fontSize: 14,
    boxSizing: "border-box", background: "var(--surface)", color: "var(--text-primary)",
  };
  const label: React.CSSProperties = { display: "block", fontSize: 13, marginBottom: 6, color: "var(--text-secondary)" };

  return (
    <div className="card" style={{ maxWidth: 660, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create a new post</h2>
        {onCancel && (
          <button onClick={onCancel} className="btn-ghost">Cancel</button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Title */}
        <div>
          <label style={label}>
            Title <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Briefly describe the issue"
            maxLength={120}
          />
          <div className="subtle-text" style={{ fontSize: 11, marginTop: 4, textAlign: "right" }}>
            {title.length}/120
          </div>
        </div>

        {/* Body */}
        <div>
          <label style={label}>
            Description <span className="subtle-text" style={{ fontSize: 11 }}>(optional)</span>
          </label>
          <textarea
            style={{ ...inputStyle, resize: "vertical" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Provide more details about your complaint..."
          />
        </div>

        {/* Category + Priority */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>
              Category <span style={{ color: "#E24B4A" }}>*</span>
            </label>
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Priority</label>
            <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value as PostPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={label}>Tags (up to 5)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="e.g. wifi, canteen"
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-ghost"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12, padding: "3px 10px", borderRadius: 20,
                    background: "var(--surface-hover)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 14, lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          Submit anonymously (your name won't be shown)
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ padding: "13px", fontSize: 14 }}
        >
          {loading ? "Submitting..." : "Submit post"}
        </button>
      </form>
    </div>
  );
}