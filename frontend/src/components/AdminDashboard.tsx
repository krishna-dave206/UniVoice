import { useState, useEffect } from "react";
import type { Post, PostStatus } from "../types";
import PostTable from "./PostTable";
import { adminApi, normaliseDoc } from "../services/api";

interface AdminStats {
  totalPosts: number;
  byStatus: Partial<Record<PostStatus, number>>;
  totalUsers: number;
  resolvedThisWeek: number;
}

const STAT_CARDS = [
  { key: "totalPosts",       label: "Total Posts",        color: "#534AB7", bg: "#EEEDFE" },
  { key: "totalUsers",       label: "Registered Users",   color: "#0F6E56", bg: "#E1F5EE" },
  { key: "resolvedThisWeek", label: "Resolved This Week", color: "#185FA5", bg: "#E6F1FB" },
  { key: "open",             label: "Open Posts",         color: "#854F0B", bg: "#FAEEDA" },
];

interface AdminDashboardProps {
  adminId?: string;
}

export default function AdminDashboard({ adminId = "" }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "posts">("overview");

  useEffect(() => {
    Promise.all([fetchStats(), fetchPosts()]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    const res = await adminApi.getStats();
    if (res.success && res.data) setStats(res.data as AdminStats);
  };

  const fetchPosts = async () => {
    const res = await adminApi.getPosts();
    if (res.success && Array.isArray(res.data)) {
      setPosts(
        (res.data as Record<string, unknown>[]).map((p) =>
          normaliseDoc(p, "postId") as unknown as Post
        )
      );
    }
  };

  const handleStatusChange = async (postId: string, status: PostStatus) => {
    const res = await adminApi.changeStatus(postId, status, adminId);
    if (res.success) {
      setPosts((prev) => prev.map((p) => (p._id === postId || p.postId === postId) ? { ...p, status } : p));
      fetchStats();
    }
  };

  const handleAssign = async (postId: string, staffId: string) => {
    await adminApi.assign(postId, staffId, adminId);
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    const res = await adminApi.delete(postId, adminId);
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p._id !== postId && p.postId !== postId));
      fetchStats();
    }
  };

  const getStatValue = (key: string): number => {
    if (!stats) return 0;
    if (key === "open") return stats.byStatus?.open ?? 0;
    return (stats as unknown as Record<string, number>)[key] ?? 0;
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
          Admin Dashboard
        </h2>
        <p className="subtle-text" style={{ marginTop: 6 }}>
          Manage all posts, assign staff, and track resolution progress
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--border)" }}>
        {(["overview", "posts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "var(--accent)" : "var(--text-secondary)",
              borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1, textTransform: "capitalize", transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      ) : activeTab === "overview" ? (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 32 }}>
            {STAT_CARDS.map((card) => (
              <div
                key={card.key}
                style={{
                  padding: "20px 20px", borderRadius: 14, background: card.bg,
                  border: `1px solid ${card.color}30`, transition: "transform 0.15s",
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 700, color: card.color, lineHeight: 1 }}>
                  {getStatValue(card.key)}
                </div>
                <div style={{ fontSize: 12, color: card.color, marginTop: 6, opacity: 0.85 }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          {stats && (
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 18px" }}>Posts by Status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(stats.byStatus).map(([st, count]) => {
                  const total = stats.totalPosts || 1;
                  const pct = Math.round(((count ?? 0) / total) * 100);
                  return (
                    <div key={st}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                        <span className="subtle-text" style={{ textTransform: "capitalize" }}>
                          {st.replace(/_/g, " ")}
                        </span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {count ?? 0} <span className="subtle-text">({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 6, background: "var(--surface-hover)", borderRadius: 3, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%", width: `${pct}%`,
                            background: "var(--accent)", borderRadius: 3, transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <PostTable
          posts={posts}
          adminId={adminId}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}