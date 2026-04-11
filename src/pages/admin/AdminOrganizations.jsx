import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import api from "../../api/api.js";
import toast from "react-hot-toast";

const INITIAL_FORM = {
  name: "",
  type: "CBO",
  focusArea: "",
  village: "",
  union: "",
  upazila: "",
  district: "",
  contactPerson: "",
  phone: "",
  email: "",
  password: "",
  description: "",
  services: "",
  status: "active",
};

const ORGANIZATION_STATUS_OPTIONS = ["pending", "active", "inactive", "suspended"];

const assertSuccess = (response, fallbackMessage) => {
  if (response.data?.success === false) {
    throw new Error(response.data.message || fallbackMessage);
  }

  return response.data;
};

const AdminOrganizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/organizations");
      const data = assertSuccess(res, "Failed to fetch organizations");
      setOrganizations(data.organizations || []);
      setCounts(data.counts || {});
    } catch (error) {
      setOrganizations([]);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleOpenModal = (mode, org = null) => {
    setModalMode(mode);
    if (mode === "edit" && org) {
      setEditingId(org._id);
      setForm({
        name: org.name || "",
        type: org.type || "CBO",
        focusArea: org.focusArea?.join(", ") || "",
        village: org.location?.village || "",
        union: org.location?.union || "",
        upazila: org.location?.upazila || "",
        district: org.location?.district || "",
        contactPerson: org.contactPerson || "",
        phone: org.phone || "",
        email: org.email || "",
        password: "",
        description: org.description || "",
        services: org.services?.join(", ") || "",
        status: org.status || "active",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.contactPerson.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      toast.error("Please fill in organization name, contact person, email, and phone");
      return;
    }

    if (modalMode === "create" && form.password.trim().length < 6) {
      toast.error("Please add a password with at least 6 characters");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        type: form.type,
        focusArea: form.focusArea
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        location: {
          village: form.village,
          union: form.union,
          upazila: form.upazila,
          district: form.district,
        },
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        description: form.description,
        services: form.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status: form.status,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (modalMode === "create") {
        const res = await api.post("/admin/organizations", payload);
        assertSuccess(res, "Failed to create organization");
        toast.success("Organization created successfully");
      } else {
        const res = await api.put(`/admin/organizations/${editingId}`, payload);
        assertSuccess(res, "Failed to update organization");
        toast.success("Organization updated successfully");
      }

      handleCloseModal();
      fetchOrganizations();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${modalMode === "create" ? "create" : "update"} organization`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/admin/organizations/${deleteTarget._id}`);
      assertSuccess(res, "Failed to delete organization");
      toast.success("Organization deleted successfully");
      setDeleteTarget(null);
      fetchOrganizations();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete organization");
    } finally {
      setDeleting(false);
    }
  };

  const orgTypes = [
    "CBO",
    "NGO",
    "CSO",
    "Local Organization",
    "Government",
    "Municipal",
    "Disaster Committee",
    "Clinic",
    "Legal Aid",
  ];

  return (
    <div className="page adminPage">
      <div className="adminPanel">
        {/* Admin Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-6 px-6 py-4">
            <button
              onClick={() => navigate("/admin")}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors"
            >
              Volunteer Opportunities
            </button>
            <button
              onClick={() => navigate("/admin/organizations")}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 pb-1"
            >
              Manage Organizations
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors"
            >
              Users & Roles
            </button>
            <button
              onClick={() => navigate("/admin/problems")}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors"
            >
              Manage Problems
            </button>
          </div>
        </div>

        <div className="adminPanelHeader">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Manage Organizations
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create, update, and manage organizations that volunteers and admins will work with.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("create")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-400"
          >
            <Plus size={20} /> Add Organization
          </button>
        </div>

        {counts.pending > 0 && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center gap-3">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">⚠</span>
            <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
              {counts.pending} organization{counts.pending > 1 ? "s are" : " is"} awaiting your approval. Find the pending cards below and click <strong>Approve Organization</strong>.
            </p>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner"></div>
            <p className="text-slate-500 mt-3">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No organizations yet</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                      {org.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {org.type}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      org.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : org.status === "pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : org.status === "suspended"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                        : org.status === "deleted"
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {org.status === "active" ? (
                      <Eye size={12} className="inline mr-1" />
                    ) : (
                      <EyeOff size={12} className="inline mr-1" />
                    )}
                    {org.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    <strong>Email:</strong> {org.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {org.phone}
                  </p>
                  {org.location?.district && (
                    <p>
                      <strong>Location:</strong> {org.location.village && org.location.village + ", "}
                      {org.location.union && org.location.union + ", "}
                      {org.location.upazila && org.location.upazila + ", "}
                      {org.location.district}
                    </p>
                  )}
                  {org.focusArea?.length > 0 && (
                    <p>
                      <strong>Focus:</strong> {org.focusArea.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {org.status === "pending" && (
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/admin/organization/${org._id}/approve`);
                          toast.success("Organization approved successfully");
                          fetchOrganizations();
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to approve");
                        }
                      }}
                      className="w-full px-3 py-2 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      ✓ Approve Organization
                    </button>
                  )}
                  {org.status === "active" && (
                    <button
                      onClick={async () => {
                        try {
                          await api.patch(`/admin/organization/${org._id}/status`, { status: "suspended" });
                          toast.success("Organization suspended");
                          fetchOrganizations();
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to suspend");
                        }
                      }}
                      className="w-full px-3 py-2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      ⏸ Suspend
                    </button>
                  )}
                  {org.status === "suspended" && (
                    <button
                      onClick={async () => {
                        try {
                          await api.patch(`/admin/organization/${org._id}/status`, { status: "active" });
                          toast.success("Organization reactivated");
                          fetchOrganizations();
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to reactivate");
                        }
                      }}
                      className="w-full px-3 py-2 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      ▶ Reactivate
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal("edit", org)}
                      disabled={org.status === "deleted"}
                      className="flex-1 px-3 py-2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(org)}
                      disabled={org.status === "deleted"}
                      className="flex-1 px-3 py-2 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal*/}
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {modalMode === "create" ? "Add Organization" : "Edit Organization"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="adminForm adminFormSection p-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="adminLabel">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <label className="adminLabel">Organization Type *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                    className="adminSelect"
                    required
                  >
                    {orgTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="adminLabel">Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label className="adminLabel">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Email address"
                    required
                  />
                </div>

                <div>
                  <label className="adminLabel">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Phone number"
                    required
                  />
                </div>

                <div>
                  <label className="adminLabel">
                    {modalMode === "create" ? "Password *" : "New Password"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder={
                      modalMode === "create"
                        ? "Set an initial password"
                        : "Leave blank to keep the current password"
                    }
                    minLength={modalMode === "create" ? 6 : undefined}
                    required={modalMode === "create"}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Location
                </h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <input
                    type="text"
                    name="village"
                    value={form.village}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Village"
                  />
                  <input
                    type="text"
                    name="union"
                    value={form.union}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Union"
                  />
                  <input
                    type="text"
                    name="upazila"
                    value={form.upazila}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="Upazila"
                  />
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="District"
                  />
                </div>
              </div>

              {/* Focus Area & Services */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="adminLabel">Focus Areas (comma-separated)</label>
                  <input
                    type="text"
                    name="focusArea"
                    value={form.focusArea}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="e.g., Education, Health, Environment"
                  />
                </div>

                <div>
                  <label className="adminLabel">Services (comma-separated)</label>
                  <input
                    type="text"
                    name="services"
                    value={form.services}
                    onChange={handleInputChange}
                    className="adminInput"
                    placeholder="e.g., Training, Medical, Support"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="adminLabel">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="adminTextarea"
                  placeholder="Organization description"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div>
                <label className="adminLabel">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="adminSelect"
                >
                  {ORGANIZATION_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Create Organization"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}

      {/* Delete Confirmation Modal */}
      {deleteTarget && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Delete Organization?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action
                cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default AdminOrganizations;
