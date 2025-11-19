import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell, Card, Spinner, Alert, Input, Button } from "../../components";
import { listUsers, toggleUserStatus, updateProfileImage, register } from "../../services/userService";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingUserId, setSavingUserId] = useState("");
  const fileInputRef = useRef(null);
  const [imageUserId, setImageUserId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("chef");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listUsers();
      setUsers(res || []);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load users";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newPassword) {
      setError("Username, email and password are required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await register({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("chef");
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to create user";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setSavingUserId(user.id);
    setError("");
    try {
      await toggleUserStatus(user.id, !user.isActive);
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update user status";
      setError(msg);
    } finally {
      setSavingUserId("");
    }
  };

  const handleImageButtonClick = (user) => {
    setImageUserId(user.id);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !imageUserId) return;
    setSavingUserId(imageUserId);
    setError("");
    try {
      await updateProfileImage(imageUserId, file);
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update profile image";
      setError(msg);
    } finally {
      setSavingUserId("");
      setImageUserId("");
    }
  };

  const filtered = users.filter((u) => {
    const searchStr = search.toLowerCase();
    const matchesSearch = search
      ? (u.username || "").toLowerCase().includes(searchStr) ||
        (u.email || "").toLowerCase().includes(searchStr)
      : true;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <PageShell
      title="Users"
      subtitle="Manage users with access to Smart Kitchen."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <Card>
          <form
            onSubmit={handleCreateUser}
            className="mb-4 p-3 rounded-md bg-slate-900/60 border border-slate-800 text-xs grid md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <Input
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Role
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button
                type="submit"
                className="px-3 py-1 text-[11px]"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create user"}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <Input
              label="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[220px]"
            />
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Role
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Status
              </label>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="px-2 py-2 text-left">Username</th>
                    <th className="px-2 py-2 text-left">Email</th>
                    <th className="px-2 py-2 text-left">Role</th>
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-900 hover:bg-slate-900/40"
                    >
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {u.picture ? (
                            <img
                              src={
                                u.picture.startsWith("http")
                                  ? u.picture
                                  : (() => {
                                      const rawBase = import.meta.env.VITE_API_BASE_URL || "";
                                      const base = rawBase.endsWith("/api")
                                        ? rawBase.slice(0, -4)
                                        : rawBase;
                                      const cleanedPath = u.picture.replace(/^\//, "");
                                      return `${base}/${cleanedPath}`;
                                    })()
                              }
                              alt={u.username || "User"}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[11px] font-semibold uppercase">
                              {(u.username || "-").charAt(0)}
                            </div>
                          )}
                          <span>{u.username || "-"}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2">{u.email || "-"}</td>
                      <td className="px-2 py-2">{u.role || "-"}</td>
                      <td className="px-2 py-2">
                        {u.isActive ? (
                          <span className="text-emerald-400">Active</span>
                        ) : (
                          <span className="text-slate-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] mr-2"
                          onClick={() => handleToggleStatus(u)}
                          disabled={savingUserId === u.id}
                        >
                          {savingUserId === u.id
                            ? "Saving..."
                            : u.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px] mr-2"
                          onClick={() => handleImageButtonClick(u)}
                          disabled={savingUserId === u.id}
                        >
                          Change image
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-[11px]"
                          onClick={() => navigate("/profile", { state: { userId: u.id } })}
                        >
                          View profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default AdminUsersPage;
