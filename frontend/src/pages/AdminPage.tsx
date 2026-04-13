import AdminDashboard from "../components/AdminDashboard";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Access Restricted</h2>
        <p className="subtle-text">The admin dashboard is only accessible to administrators.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "28px auto", padding: "0 16px" }}>
      <AdminDashboard adminId={user._id} />
    </div>
  );
}
