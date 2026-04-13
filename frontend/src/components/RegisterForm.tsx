import { useState } from "react";
import type { UserRole } from "../types";

interface RegisterFormProps {
  onSuccess: (formData: unknown) => Promise<void>;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student" as UserRole,
    gender: "", department: "", yearOfStudy: 1,
    rollNumber: "", course: "",
    employeeId: "", designation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!form.name.trim()) return setError("Full name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (!form.gender) return setError("Please select a gender");
    if (!form.department.trim()) return setError("Department is required");

    if (form.role === "student") {
      if (!form.rollNumber.trim()) return setError("Roll number is required for students");
      if (!form.course.trim()) return setError("Course is required for students");
    }
    if (form.role === "faculty") {
      if (!form.employeeId.trim()) return setError("Employee ID is required for faculty");
      if (!form.designation.trim()) return setError("Designation is required for faculty");
    }

    setLoading(true);
    try {
      await onSuccess(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border)", fontSize: 14,
    boxSizing: "border-box", background: "var(--surface)", color: "var(--text-primary)",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, marginBottom: 6, color: "var(--text-secondary)",
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 14 };

  return (
    <div style={{
      width: "100%", maxWidth: 500, margin: "0 auto",
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "36px 32px",
      boxShadow: "var(--shadow)",
    }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create your account</h2>
        <p className="subtle-text" style={{ marginTop: 6, fontSize: 13 }}>
          Join the UniVoice community
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>College email</label>
          <input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@rishihood.edu.in" required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Password <span className="subtle-text">(min 8 chars)</span></label>
          <input style={inputStyle} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" required />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Role</label>
            <select style={inputStyle} value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select style={inputStyle} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Department</label>
            <input style={inputStyle} value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. CSE" required />
          </div>
          <div>
            <label style={labelStyle}>Year of study</label>
            <input style={inputStyle} type="number" min={1} max={6} value={form.yearOfStudy} onChange={(e) => set("yearOfStudy", Number(e.target.value))} />
          </div>
        </div>

        {form.role === "student" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Roll number</label>
              <input style={inputStyle} value={form.rollNumber} onChange={(e) => set("rollNumber", e.target.value)} placeholder="e.g. RU2024001" />
            </div>
            <div>
              <label style={labelStyle}>Course</label>
              <input style={inputStyle} value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="e.g. B.Tech CSE" />
            </div>
          </div>
        )}

        {form.role === "faculty" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Employee ID</label>
              <input style={inputStyle} value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} placeholder="e.g. FAC001" />
            </div>
            <div>
              <label style={labelStyle}>Designation</label>
              <input style={inputStyle} value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. Assistant Professor" />
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "12px", marginTop: 4 }}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}