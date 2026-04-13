import { useState, useEffect } from "react";
import type { Announcement } from "../types";
import { announcementsApi, normaliseDoc } from "../services/api";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    announcementsApi.getAll().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAnnouncements(
          (res.data as Record<string, unknown>[]).map(
            (a) => normaliseDoc(a, "announcementId") as unknown as Announcement
          )
        );
      }
    });
  }, []);

  if (!visible || announcements.length === 0) return null;

  const current = announcements[currentIdx];

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #EEEDFE 0%, #e8e6ff 100%)",
        borderBottom: "1px solid #AFA9EC",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {current.isPinned && (
        <span
          style={{
            fontSize: 10, fontWeight: 700, background: "#534AB7", color: "#fff",
            padding: "2px 8px", borderRadius: 20, flexShrink: 0, letterSpacing: "0.05em",
          }}
        >
          PINNED
        </span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#3C3489", marginRight: 8 }}>
          {current.title}:
        </span>
        <span style={{ fontSize: 13, color: "#534AB7" }}>{current.body}</span>
      </div>

      {announcements.length > 1 && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
          <button
            onClick={() => setCurrentIdx((i) => (i - 1 + announcements.length) % announcements.length)}
            style={{ background: "none", border: "none", color: "#534AB7", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}
          >
            ‹
          </button>
          <span style={{ fontSize: 11, color: "#534AB7" }}>
            {currentIdx + 1}/{announcements.length}
          </span>
          <button
            onClick={() => setCurrentIdx((i) => (i + 1) % announcements.length)}
            style={{ background: "none", border: "none", color: "#534AB7", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}
          >
            ›
          </button>
        </div>
      )}

      <button
        onClick={() => setVisible(false)}
        style={{ background: "none", border: "none", color: "#534AB7", cursor: "pointer", fontSize: 20, lineHeight: 1, flexShrink: 0 }}
        aria-label="Dismiss announcement"
      >
        ×
      </button>
    </div>
  );
}