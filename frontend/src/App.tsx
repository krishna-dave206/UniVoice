import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetailPage from "./pages/PostDetailPage";
import AdminPage from "./pages/AdminPage";
import PostForm from "./components/PostForm";
import "./App.css";

type Page = "home" | "login" | "register" | "detail" | "create" | "admin";

function AppShell() {
  const { user, isLoading, logout } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const navigate = (p: string) => setPage(p as Page);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setPage("detail");
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading UniVoice...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* ── Navigation ── */}
      <header className="navbar">
        <div className="navbar-inner">
          <button className="nav-logo" onClick={() => setPage("home")}>
            UniVoice
            <span className="nav-subtitle">· Rishihood University</span>
          </button>

          <nav className="nav-links">
            <button
              className={page === "home" ? "nav-btn nav-btn-active" : "nav-btn"}
              onClick={() => setPage("home")}
            >
              Posts
            </button>

            {user && (
              <button
                className={page === "create" ? "nav-btn nav-btn-active" : "nav-btn"}
                onClick={() => setPage("create")}
              >
                + New Post
              </button>
            )}

            {user?.role === "admin" && (
              <button
                className={page === "admin" ? "nav-btn nav-btn-active" : "nav-btn"}
                onClick={() => setPage("admin")}
              >
                Admin
              </button>
            )}

            {user ? (
              <div className="nav-user-area">
                <span className="nav-avatar" title={user.email}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="nav-name">{user.name.split(" ")[0]}</span>
                <button className="nav-btn" onClick={logout}>
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="nav-btn" onClick={() => setPage("login")}>
                  Sign in
                </button>
                <button className="btn-primary" onClick={() => setPage("register")}>
                  Register
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="main-content">
        {page === "home" && <Home onPostClick={handlePostClick} />}

        {page === "login" && <Login onNavigate={navigate} />}

        {page === "register" && <Register onNavigate={navigate} />}

        {page === "detail" && selectedPostId && (
          <PostDetailPage
            postId={selectedPostId}
            onBack={() => setPage("home")}
          />
        )}

        {page === "create" && user && (
          <div style={{ maxWidth: 660, margin: "36px auto", padding: "0 16px" }}>
            <PostForm
              userId={user._id}
              onSuccess={() => setPage("home")}
              onCancel={() => setPage("home")}
            />
          </div>
        )}

        {page === "admin" && <AdminPage />}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>© 2026 UniVoice · Rishihood University Complaint Management System</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}