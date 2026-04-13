
import { useState } from "react";
import { PostPriority } from "../types";

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
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags((prev) => [...prev, t]);
    }
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
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, body, category, priority, tags, isAnonymous }),
      });

      const data = await res.json();
      if (!data.success) return setError(data.message);
      onSuccess();
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 14, boxSizing: "border-box" as const };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Create a new post</h2>
        {onCancel && (
          <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer" }}>Cancel</button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Title */}
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "var(--color-text-secondary)" }}>
            Title <span style={{ color: "#E24B4A" }}>*</span>
          </label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Briefly describe the issue" maxLength={120} />
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4, textAlign: "right" }}>{title.length}/120</div>
        </div>

        {/* Body */}
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "var(--color-text-secondary)" }}>
            Description <span style={{ fontSize: 11 }}>(optional)</span>
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
            <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "var(--color-text-secondary)" }}>
              Category <span style={{ color: "#E24B4A" }}>*</span>
            </label>
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "var(--color-text-secondary)" }}>Priority</label>
            <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value as PostPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "var(--color-text-secondary)" }}>Tags (up to 5)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="e.g. wifi, canteen"
            />
            <button type="button" onClick={addTag} style={{ padding: "10px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "none", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {tags.map((tag) => (
                <span key={tag} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  #{tag}
                  <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} style={{ width: 16, height: 16 }} />
          Submit anonymously (your name won't be shown)
        </label>

        {error && (
          <div style={{ padding: "10px 12px", background: "#FCEBEB", color: "#791F1F", borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "12px", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Submitting..." : "Submit post"}
        </button>
      </form>
    </div>
  );
}