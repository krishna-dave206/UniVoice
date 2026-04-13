import { useState } from "react";
import PostFeed from "./components/PostFeed";
import { PostDetail } from "./components/PostDetail";
import PostForm from "./components/PostForm";
import AdminDashboard from "./components/AdminDashboard";
import AnnouncementBanner from "./components/AnnouncementBanner";
import "./App.css";

// Simple client-side "router" using state — replace with react-router if needed
type Page = "feed" | "create" | "detail" | "admin";

function App() {
  const [page, setPage] = useState<Page>("feed");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Mock auth state — Somraj will replace this with real JWT context
  const mockUser = {
    userId: "user-001",
    name: "Krishna",
    role: "student" as const,
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setPage("detail");
  };

  return (
    <div className="app">
      {/* Announcements banner — Himani's component */}
      <AnnouncementBanner />

      {/* Nav */}
      <nav className="nav">
        <span className="nav-logo">SCMS — Rishihood University</span>
        <div className="nav-links">
          <button onClick={() => setPage("feed")}>Posts</button>
          <button onClick={() => setPage("create")}>+ New Post</button>
          {mockUser.role === "admin" && (
            <button onClick={() => setPage("admin")}>Admin</button>
          )}
          <span className="nav-user">{mockUser.name}</span>
        </div>
      </nav>

      {/* Pages */}
      <main className="main">
        {page === "feed" && (
          <PostFeed onPostClick={handlePostClick} />
        )}
        {page === "create" && (
          <PostForm
            userId={mockUser.userId}
            onSuccess={() => setPage("feed")}
          />
        )}
        {page === "detail" && selectedPostId && (
          <PostDetail
            postId={selectedPostId}
            currentUserId={mockUser.userId}
            onBack={() => setPage("feed")}
          />
        )}
        {page === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;