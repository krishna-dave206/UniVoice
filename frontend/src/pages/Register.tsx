import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../context/AuthContext";

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const { register } = useAuth();

  // Returns undefined on success, throws on failure so RegisterForm can catch
  const handleSuccess = async (formData: unknown) => {
    const err = await register(formData);
    if (err) throw new Error(err);
    onNavigate("home");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "24px" }}>
      <RegisterForm
        onSuccess={handleSuccess}
        onSwitchToLogin={() => onNavigate("login")}
      />
    </div>
  );
}
