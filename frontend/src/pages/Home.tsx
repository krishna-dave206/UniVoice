import PostFeed from "../components/PostFeed";
import AnnouncementBanner from "../components/AnnouncementBanner";
import { useAuth } from "../context/AuthContext";

interface HomeProps {
  onPostClick: (postId: string) => void;
}

export default function Home({ onPostClick }: HomeProps) {
  const { user } = useAuth();

  return (
    <div>
      <AnnouncementBanner />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 0" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            UniVoice — Complaint Feed
          </h1>
          <p className="subtle-text" style={{ marginTop: 6 }}>
            View, vote on, and track complaints from your university community
          </p>
        </div>
        <PostFeed
          onPostClick={onPostClick}
          currentUserId={user?._id ?? "guest"}
        />
      </div>
    </div>
  );
}
