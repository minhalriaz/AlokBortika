import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Star,
  MapPin,
  Building2,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/api";

const CATEGORIES = [
  "Education",
  "Environment",
  "Healthcare",
  "Food Relief",
  "Elderly Care",
  "Animal Rescue",
  "Disaster Relief",
  "Community",
  "Other",
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  category: "Education",
  organization: "",
  location: "",
  duration: "",
  spots: "1",
  color: "#3d8b7a",
  requirements: "",
  benefits: "",
  isActive: true,
  isFeatured: false,
  image: null,
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeOpportunity(item) {
  return {
    id: item.id || item._id,
    title: item.title || "",
    description: item.description || "",
    category: item.category || "Other",
    organization: item.organization || "",
    location: item.location || "",
    duration: item.duration || "",
    spots: Number(item.spots ?? item.totalSpots ?? 0),
    spotsRemaining: Number(
      item.spotsRemaining ?? item.remainingSpots ?? item.availableSpots ?? item.spots ?? 0
    ),
    color: item.color || "#3d8b7a",
    isActive: Boolean(item.isActive ?? true),
    isFeatured: Boolean(item.isFeatured ?? false),
    requirements: Array.isArray(item.requirements)
      ? item.requirements.join("\n")
      : item.requirements || "",
    benefits: Array.isArray(item.benefits) ? item.benefits.join("\n") : item.benefits || "",
    imageUrl: item.imageUrl || item.image || item.thumbnail || "",
    raw: item,
  };
}

function parseListField(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function OpportunityCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 h-44 rounded-2xl bg-slate-200" />
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-200" />
        <div className="h-6 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="mb-3 h-6 w-3/4 rounded bg-slate-200" />
      <div className="mb-2 h-4 w-1/2 rounded bg-slate-200" />
      <div className="mb-4 h-4 w-2/3 rounded bg-slate-200" />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-100" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl bg-slate-200" />
        <div className="h-10 flex-1 rounded-xl bg-slate-200" />
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <ImageIcon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">No opportunities yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Start by creating your first volunteer opportunity. You can add images, highlight
        featured campaigns, and manage availability from here.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-400"
      >
        <Plus className="h-4 w-4" />
        Add Opportunity
      </button>
    </div>
  );
}

function DeleteConfirmModal({ open, item, onClose, onConfirm, deleting }) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Delete opportunity</h3>
            <p className="mt-1 text-sm text-slate-500">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-slate-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">{item.title}</span>?
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function OpportunityModal({
  open,
  mode,
  form,
  previewUrl,
  setForm,
  setPreviewUrl,
  onClose,
  onSubmit,
  saving,
}) {
  const fileInputRef = useRef(null);

  if (!open) return null;

  const title = mode === "create" ? "Add Opportunity" : "Edit Opportunity";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));

    if (file) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-5xl rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Fill in the details to publish or update a volunteer opportunity.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="adminForm adminFormSection grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Opportunity image</p>

              <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                    <ImageIcon className="h-10 w-10" />
                    <p className="text-sm">No image selected</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <Upload className="h-4 w-4" />
                  Upload image
                </button>

                {previewUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, image: null }));
                      setPreviewUrl("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Visibility settings</p>

              <label className="mb-3 flex cursor-pointer items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-800">Active</p>
                  <p className="text-xs text-slate-500">Show this opportunity publicly</p>
                </div>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-800">Featured</p>
                  <p className="text-xs text-slate-500">Highlight this card in listings</p>
                </div>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Title">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Beach cleanup campaign"
                />
              </Field>

              <Field label="Category">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Organization">
                <input
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Green Earth Foundation"
                />
              </Field>

              <Field label="Location">
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Dhaka, Bangladesh"
                />
              </Field>

              <Field label="Duration">
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="2 weeks"
                />
              </Field>

              <Field label="Spots">
                <input
                  type="number"
                  min="1"
                  name="spots"
                  value={form.spots}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Theme Color">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
                  />
                </div>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                className={inputClass}
                placeholder="Describe the mission, impact, and volunteer activities..."
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Requirements (one per line)">
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={6}
                  className={inputClass}
                  placeholder={"Must be 18+\nAvailable on weekends\nBasic communication skills"}
                />
              </Field>

              <Field label="Benefits (one per line)">
                <textarea
                  name="benefits"
                  value={form.benefits}
                  onChange={handleChange}
                  rows={6}
                  className={inputClass}
                  placeholder={"Certificate of participation\nTraining included\nTeam networking"}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? "Saving..." : mode === "create" ? "Create Opportunity" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

export default function AdminOpportunities() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      toast.error("Access denied");
      navigate("/login"); // or dashboard
    }
  }, [navigate]);

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  }, [opportunities]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/opportunities?limit=100");

      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.opportunities)
        ? res.data.opportunities
        : [];

      setOpportunities(items.map(normalizeOpportunity));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load opportunities."
      );
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setPreviewUrl("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category || "Education",
      organization: item.organization || "",
      location: item.location || "",
      duration: item.duration || "",
      spots: String(item.spots || 1),
      color: item.color || "#3d8b7a",
      requirements: item.requirements || "",
      benefits: item.benefits || "",
      isActive: Boolean(item.isActive),
      isFeatured: Boolean(item.isFeatured),
      image: null,
    });
    setPreviewUrl(item.imageUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("description", form.description.trim());
    data.append("category", form.category);
    data.append("organization", form.organization.trim());
    data.append("location", form.location.trim());
    data.append("duration", form.duration.trim());
    data.append("spots", String(form.spots || 1));
    data.append("color", form.color);
    data.append("requirements", JSON.stringify(parseListField(form.requirements)));
    data.append("benefits", JSON.stringify(parseListField(form.benefits)));
    data.append("isActive", String(form.isActive));
    data.append("isFeatured", String(form.isFeatured));

    if (form.image) {
      data.append("image", form.image);
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.organization.trim()) {
      toast.error("Please fill in title, description, and organization.");
      return;
    }

    try {
      setSaving(true);

      const payload = buildFormData();

      if (modalMode === "create") {
        await api.post("/opportunities", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Opportunity created successfully.");
      } else {
        await api.put(`/opportunities/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Opportunity updated successfully.");
      }

      closeModal();
      fetchOpportunities();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${modalMode === "create" ? "create" : "update"} opportunity.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await api.delete(`/opportunities/${deleteTarget.id}`);
      toast.success("Opportunity deleted.");
      setDeleteTarget(null);
      fetchOpportunities();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete opportunity.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      setTogglingId(item.id);

      const payload = new FormData();
      payload.append("title", item.title);
      payload.append("description", item.description);
      payload.append("category", item.category);
      payload.append("organization", item.organization);
      payload.append("location", item.location);
      payload.append("duration", item.duration);
      payload.append("spots", String(item.spots || 1));
      payload.append("color", item.color || "#3d8b7a");
      payload.append("requirements", JSON.stringify(parseListField(item.requirements || "")));
      payload.append("benefits", JSON.stringify(parseListField(item.benefits || "")));
      payload.append("isActive", String(!item.isActive));
      payload.append("isFeatured", String(item.isFeatured));

      await api.put(`/opportunities/${item.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `Opportunity ${item.isActive ? "deactivated" : "activated"} successfully.`
      );
      fetchOpportunities();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="page adminPage">
      <div className="adminPanel">
        {/* Admin Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-6 px-6 py-4">
            <button
              onClick={() => navigate("/admin")}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 pb-1"
            >
              Volunteer Opportunities
            </button>
            <button
              onClick={() => navigate("/admin/organizations")}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors"
            >
              Manage Organizations
            </button>
          </div>
        </div>

        <div className="adminPanelHeader">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Volunteer Opportunities
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage listings, feature priority opportunities, and keep openings up to date.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-400"
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <OpportunityCardSkeleton key={idx} />
            ))}
          </div>
        ) : sortedOpportunities.length === 0 ? (
          <EmptyState onAdd={openCreateModal} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sortedOpportunities.map((item) => {
              const percentageFilled =
                item.spots > 0
                  ? Math.max(
                      0,
                      Math.min(100, Math.round(((item.spots - item.spotsRemaining) / item.spots) * 100))
                    )
                  : 0;

              return (
                <div
                  key={item.id}
                  className={classNames(
                    "group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl",
                    item.isActive
                      ? "border border-slate-200"
                      : "border-2 border-dashed border-slate-300 opacity-90"
                  )}
                >
                  <div
                    className="relative h-52 overflow-hidden"
                    style={{
                      background:
                        item.imageUrl
                          ? undefined
                          : `linear-gradient(135deg, ${item.color || "#3d8b7a"}22, #e2e8f0)`,
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${item.color || "#3d8b7a"}22` }}
                        >
                          <ImageIcon
                            className="h-8 w-8"
                            style={{ color: item.color || "#3d8b7a" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
                        {item.category}
                      </span>
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute right-4 top-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-semibold text-white shadow">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white shadow">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="line-clamp-1">{item.organization || "Unknown organization"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="line-clamp-1">{item.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        <span>{item.duration || "Flexible duration"}</span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Users className="h-4 w-4" />
                          Spots remaining
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.spotsRemaining} / {item.spots}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentageFilled}%`,
                            background: item.color || "#3d8b7a",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={togglingId === item.id}
                        className={classNames(
                          "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                          item.isActive
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        )}
                      >
                        {togglingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : item.isActive ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {item.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center justify-center rounded-xl bg-rose-50 p-2.5 text-rose-700 transition hover:bg-rose-100"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <OpportunityModal
          open={modalOpen}
          mode={modalMode}
          form={form}
          previewUrl={previewUrl}
          setForm={setForm}
          setPreviewUrl={setPreviewUrl}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
        />

        <DeleteConfirmModal
          open={Boolean(deleteTarget)}
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      </div>
    </div>
  );
}