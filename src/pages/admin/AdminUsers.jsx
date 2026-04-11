import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, UserRound, Search, Trash2, RefreshCcw, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";

const EMPTY_FILTERS = { search: "", role: "all", status: "all" };

const badgeClass = (value, map) => map[value] || "bg-slate-100 text-slate-700";
const EMPTY_COUNTS = { total: 0, admins: 0, volunteers: 0, active: 0, suspended: 0 };

const assertSuccess = (response, fallbackMessage) => {
  if (response.data?.success === false) {
    throw new Error(response.data.message || fallbackMessage);
  }

  return response.data;
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", { params: filters });
      const data = assertSuccess(res, "Failed to fetch users");
      setUsers(data.users || []);
      setCounts(data.counts || EMPTY_COUNTS);
    } catch (error) {
      setUsers([]);
      setCounts(EMPTY_COUNTS);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

const fetchOrganizations = useCallback(async () => {
    try {
      const res = await api.get("/admin/organization-options");
      const data = assertSuccess(res, "Failed to fetch organizations");
      setOrganizations(data.organizations || []);
    } catch (_error) {
      setOrganizations([]);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserUpdate = async (userId, payload) => {
    try {
      setSavingId(userId);
      const res = await api.patch(`/admin/users/${userId}`, payload);
      const data = assertSuccess(res, "Failed to update user");
      const updated = data.user;
      setUsers((prev) => prev.map((item) => (item._id === userId ? updated : item)));
      toast.success(data.message || "User updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update user");
    } finally {
      setSavingId("");
      fetchUsers();
    }
  };

  const handleDelete = async (userId) => {
    const ok = window.confirm("Delete this user account? This cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(userId);
      const res = await api.delete(`/admin/users/${userId}`);
      const data = assertSuccess(res, "Failed to delete user");
      toast.success(data.message || "User deleted");
      setUsers((prev) => prev.filter((item) => item._id !== userId));
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete user");
    } finally {
      setDeletingId("");
    }
  };

  const organizationOptions = useMemo(() => organizations.filter((org) => org.status !== "inactive"), [organizations]);

  return (
    <div className="page adminPage">
      <div className="adminPanel">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-6 px-6 py-4 flex-wrap">
            <button onClick={() => navigate("/admin")} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors">Volunteer Opportunities</button>
            <button onClick={() => navigate("/admin/organizations")} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors">Manage Organizations</button>
            <button onClick={() => navigate("/admin/users")} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 pb-1">Users & Roles</button>
          </div>
        </div>

        <div className="adminPanelHeader">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Admin Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Users & Roles Management</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Search users, change roles, set account status, and assign volunteers to organizations.</p>
          </div>
          <button onClick={fetchUsers} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        <div className="adminStatGrid">
          <div className="adminStatCard"><div className="adminStatTitle">Total Users</div><div className="adminStatValue">{counts.total}</div></div>
          <div className="adminStatCard"><div className="adminStatTitle">Admins</div><div className="adminStatValue">{counts.admins}</div></div>
          <div className="adminStatCard"><div className="adminStatTitle">Volunteers</div><div className="adminStatValue">{counts.volunteers}</div></div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_180px_180px] mb-6">
          <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Search size={16} /> Search</div>
            <input className="w-full border-0 bg-transparent outline-none text-slate-800" placeholder="Search by name or email" name="search" value={filters.search} onChange={handleChange} />
          </label>
          <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-slate-700">Role</div>
            <select className="w-full border-0 bg-transparent outline-none text-slate-800" name="role" value={filters.role} onChange={handleChange}>
              <option value="all">All roles</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-slate-700">Status</div>
            <select className="w-full border-0 bg-transparent outline-none text-slate-800" name="status" value={filters.status} onChange={handleChange}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No users found for the current filters.</div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user._id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 xl:grid-cols-[1.3fr_160px_170px_1fr_auto] items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(user.role, { admin: "bg-violet-100 text-violet-700", volunteer: "bg-emerald-100 text-emerald-700" })}`}>
                        {user.role === "admin" ? <Shield size={14} /> : <UserRound size={14} />}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(user.status, { active: "bg-green-100 text-green-700", inactive: "bg-amber-100 text-amber-700", suspended: "bg-rose-100 text-rose-700" })}`}>
                        {user.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>Verified: {user.isAccountVerified ? "Yes" : "No"}</span>
                      <span className="inline-flex items-center gap-1"><Building2 size={14} /> {user.organizationId?.name || "No organization assigned"}</span>
                    </div>
                  </div>

                  <label className="rounded-2xl border border-slate-200 px-3 py-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Role</div>
                    <select className="w-full border-0 bg-transparent outline-none" value={user.role} onChange={(e) => handleUserUpdate(user._id, { role: e.target.value })} disabled={savingId === user._id}>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>

                  <label className="rounded-2xl border border-slate-200 px-3 py-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
                    <select className="w-full border-0 bg-transparent outline-none" value={user.status || "active"} onChange={(e) => handleUserUpdate(user._id, { status: e.target.value })} disabled={savingId === user._id}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </label>

                  <label className="rounded-2xl border border-slate-200 px-3 py-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Organization</div>
                    <select className="w-full border-0 bg-transparent outline-none" value={user.organizationId?._id || ""} onChange={(e) => handleUserUpdate(user._id, e.target.value ? { organizationId: e.target.value } : { clearOrganization: true })} disabled={savingId === user._id}>
                      <option value="">No organization</option>
                      {organizationOptions.map((org) => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </label>

                  <button type="button" onClick={() => handleDelete(user._id)} disabled={deletingId === user._id || savingId === user._id} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    <Trash2 size={16} /> {deletingId === user._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
