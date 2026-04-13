import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { login } = useAuth();

  // Returns undefined on success, throws on failure so LoginForm can catch
  const handleSuccess = async (email: string, password: string) => {
    const err = await login(email, password);
    if (err) throw new Error(err);
    onNavigate("home");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "24px" }}>
      <LoginForm
        onSuccess={handleSuccess}
        onSwitchToRegister={() => onNavigate("register")}
      />
    </div>
  );
}
