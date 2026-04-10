import type { User } from "../types/user";

interface Props {
  user: User;
  onDelete: (id: number) => void;
}

export default function UserCard({ user, onDelete }: Props) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: "1rem", marginBottom: "0.75rem" }}>
      <h3 style={{ margin: 0 }}>{user.name}</h3>
      <p style={{ margin: "0.25rem 0", color: "#666" }}>{user.email}</p>
      <button
        onClick={() => onDelete(user.id)}
        style={{ marginTop: "0.5rem", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 4, padding: "0.25rem 0.75rem", cursor: "pointer" }}
      >
        Delete
      </button>
    </div>
  );
}
