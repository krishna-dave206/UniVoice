import { useState } from "react";
import type { Post, PostStatus } from "../types";

interface PostTableProps {
  posts: Post[];
  adminId: string;
  onStatusChange: (postId: string, status: PostStatus) => void;
  onAssign: (postId: string, staffId: string) => void;
  onDelete: (postId: string) => void;
}

const ALL_STATUSES: PostStatus[] = [
  "open", "in_review", "in_progress", "resolved", "closed", "rejected",
];

const STATUS_COLORS: Record<PostStatus, string> = {
  open:        "#534AB7",
  in_review:   "#BA7517",
  in_progress: "#185FA5",
  resolved:    "#0F6E56",
  closed:      "#444441",
  rejected:    "#A32D2D",
};

type SortKey = "createdAt" | "status" | "priority" | "upvotes";

export default function PostTable({ posts, onStatusChange, onDelete }: PostTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = posts
    .filter((p) => !filterStatus || p.status === filterStatus)
    .filter((p) => !filterCategory || p.category === filterCategory)
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va: unknown, vb: unknown;
      if (sortKey === "createdAt") { va = new Date(a.createdAt).getTime(); vb = new Date(b.createdAt).getTime(); }
      else if (sortKey === "upvotes") { va = a.upvotes; vb = b.upvotes; }
      else if (sortKey === "status") { va = a.status; vb = b.status; }
      else { va = a.priority; vb = b.priority; }
      if (va === vb) return 0;
      return sortAsc ? (va! > vb! ? 1 : -1) : (va! < vb! ? 1 : -1);
    });

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const th = (key: SortKey, label: string) => (
    <th
      onClick={() => toggleSort(key)}
      style={{
        padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600,
        color: "var(--text-secondary)", borderBottom: "1px solid var(--border)",
        cursor: "pointer", whiteSpace: "nowrap", userSelect: "none",
        background: sortKey === key ? "var(--surface-hover)" : "transparent",
      }}
    >
      {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          style={{
            flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--border)", fontSize: 13,
            background: "var(--surface)", color: "var(--text-primary)",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PostStatus | "")}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)", color: "var(--text-primary)" }}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "var(--surface)", color: "var(--text-primary)" }}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="subtle-text" style={{ marginBottom: 10 }}>
        {filtered.length} of {posts.length} posts
      </div>

      <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {th("createdAt", "Title")}
              {th("status", "Status")}
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>Category</th>
              {th("priority", "Priority")}
              {th("upvotes", "Votes")}
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>Change Status</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "40px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
                  No posts match the current filters
                </td>
              </tr>
            ) : (
              filtered.map((post, idx) => {
                const pid = post._id ?? post.postId;
                return (
                  <tr
                    key={pid}
                    style={{ background: idx % 2 === 0 ? "transparent" : "var(--surface-hover)" }}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>
                        {post.title}
                      </div>
                      <div className="subtle-text" style={{ fontSize: 11 }}>
                        {new Date(post.createdAt).toLocaleDateString("en-IN")}
                        {post.isAnonymous ? " · anonymous" : ""}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                          background: STATUS_COLORS[post.status] + "18",
                          color: STATUS_COLORS[post.status],
                        }}
                      >
                        {post.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                      {post.category}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      {post.priority}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                      ▲{post.upvotes} ▼{post.downvotes}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <select
                        value={post.status}
                        onChange={(e) => onStatusChange(pid, e.target.value as PostStatus)}
                        style={{
                          padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)",
                          fontSize: 12, background: "var(--surface)", color: "var(--text-primary)",
                        }}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button
                        onClick={() => { if (confirm("Delete this post?")) onDelete(pid); }}
                        className="btn-danger-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}