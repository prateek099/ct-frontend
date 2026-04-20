import { useState } from "react";
import { Plus, Trash2, Loader, Users } from "lucide-react";
import { useUsers, useCreateUser, useDeleteUser } from "../api/useUsers";

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

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center">
          <Users size={18} className="text-stone-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Users</h1>
          <p className="text-stone-500 text-xs">Manage Creator Tools accounts</p>
        </div>
      </div>

      {/* Add user form */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-800 mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
            required
            className="flex-[2] bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={createUser.isPending}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {createUser.isPending ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </button>
        </form>
      </div>

      {/* Users list */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-stone-400">
            <Loader size={20} className="animate-spin mr-2" />
            <span className="text-sm">Loading users…</span>
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-sm text-red-600">
            Failed to load users.
          </div>
        )}

        {!isLoading && !error && users?.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-400">
            No users yet. Add one above!
          </div>
        )}

        {users && users.length > 0 && (
          <ul className="divide-y divide-stone-100">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{user.name}</p>
                    <p className="text-xs text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteUser.mutate(user.id)}
                  disabled={deleteUser.isPending}
                  className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  title="Delete user"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
