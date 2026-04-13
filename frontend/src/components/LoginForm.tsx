import { useState } from "react";

interface LoginFormProps {
  onSuccess: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    try {
      await onSuccess(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border)", fontSize: 14,
    boxSizing: "border-box", background: "var(--surface)",
    color: "var(--text-primary)", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, marginBottom: 6, color: "var(--text-secondary)",
  };

  return (
    <div style={{
      width: "100%", maxWidth: 420, margin: "0 auto",
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "36px 32px",
      boxShadow: "var(--shadow)",
    }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Sign in to UniVoice</h2>
        <p className="subtle-text" style={{ marginTop: 6, fontSize: 13 }}>
          Rishihood University Complaint System
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>College email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@rishihood.edu.in"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", marginTop: 4, padding: "12px" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
        No account?{" "}
        <button
          onClick={onSwitchToRegister}
          style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          Register here
        </button>
      </p>
    </div>
  );
}