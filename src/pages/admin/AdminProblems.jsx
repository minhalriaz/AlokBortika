import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function AdminProblems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const res = await api.get("/problem/all");
      if (res.data.success) {
        setProblems(res.data.problems);
      }
    };
    fetchProblems();
  }, []);

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
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 pb-1 transition-colors"
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
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 pb-1"
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
              Manage Problems
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              View and manage reported community problems.
            </p>
          </div>
        </div>

        {problems.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>

            <select
              value={p.status}
              onChange={async (e) => {
                await api.put(`/problem/update-status/${p._id}`, {
                  status: e.target.value,
                });
                window.location.reload();
              }}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}