import { PostDetail } from "../components/PostDetail";
import { useAuth } from "../context/AuthContext";

interface PostDetailPageProps {
  postId: string;
  onBack: () => void;
}

export default function PostDetailPage({ postId, onBack }: PostDetailPageProps) {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 760, margin: "28px auto", padding: "0 16px" }}>
      <PostDetail
        postId={postId}
        currentUserId={user?._id ?? "guest"}
        onBack={onBack}
      />
    </div>
  );
}
