import { useState } from "react";
import { useUsers, useCreateUser, useDeleteUser } from "../api/useUsers";
import UserCard from "../components/UserCard";

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    createUser.mutate({ name, email }, { onSuccess: () => { setName(""); setEmail(""); } });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error fetching users.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Creator Tools — Users</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{ flex: 1, padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ flex: 2, padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", background: "#3182ce", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Add
        </button>
      </form>

      {users?.map((user) => (
        <UserCard key={user.id} user={user} onDelete={(id) => deleteUser.mutate(id)} />
      ))}

      {users?.length === 0 && <p>No users yet. Add one above!</p>}
    </div>
  );
}
