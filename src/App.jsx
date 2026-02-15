import { useState, useEffect, useRef } from "react";

const STATUS_CONFIG = {
  Applied: { bg: "#E8F4FD", text: "#1565C0", dot: "#1565C0" },
  Interviewing: { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
  Accepted: { bg: "#E8F5E9", text: "#2E7D32", dot: "#4CAF50" },
  Rejected: { bg: "#FFEBEE", text: "#C62828", dot: "#EF5350" },
};

const PRIORITY_CONFIG = {
  High: { bg: "#FFEBEE", text: "#C62828" },
  Medium: { bg: "#FFF8E1", text: "#F57F17" },
  Low: { bg: "#E0F2F1", text: "#00695C" },
};

const EMPTY_FORM = {
  companyName: "",
  teamName: "",
  role: "",
  websiteLink: "",
  resumeFileName: "",
  coverLetter: "",
  coverLetterType: "none",
  referralGiven: "No",
  recruiterOutreach: "No",
  recruiterContact: "",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied",
  priority: "Medium",
  followUpDate: "",
  salaryRange: "",
  interviewRound: "",
  notes: "",
};

const STORAGE_KEY = "job-tracker-apps";

function loadApps() {
  try {
    const result = window.localStorage?.getItem(STORAGE_KEY);
    return result ? JSON.parse(result) : [];
  } catch {
    return [];
  }
}

function saveApps(apps) {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {}
}

export default function JobTracker() {
  const [apps, setApps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("table");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("dateApplied");
  const [sortDir, setSortDir] = useState("desc");
  const formRef = useRef(null);

  useEffect(() => {
    setApps(loadApps());
  }, []);

  useEffect(() => {
    if (apps.length > 0) saveApps(apps);
  }, [apps]);

  const handleSubmit = () => {
    if (!form.companyName || !form.role) return;
    if (editingId) {
      setApps((prev) =>
        prev.map((a) => (a.id === editingId ? { ...form, id: editingId } : a))
      );
    } else {
      setApps((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (app) => {
    setForm({ ...app });
    setEditingId(app.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = (id) => {
    const updated = apps.filter((a) => a.id !== id);
    setApps(updated);
    saveApps(updated);
  };

  const filtered = apps
    .filter((a) => filterStatus === "All" || a.status === filterStatus)
    .filter(
      (a) =>
        !searchQuery ||
        a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortField] || "";
      const vb = b[sortField] || "";
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const stats = {
    total: apps.length,
    applied: apps.filter((a) => a.status === "Applied").length,
    interviewing: apps.filter((a) => a.status === "Interviewing").length,
    accepted: apps.filter((a) => a.status === "Accepted").length,
    rejected: apps.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #2D2D2D !important; box-shadow: 0 0 0 3px rgba(45,45,45,0.08); }
        ::placeholder { color: #999; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .row-hover:hover { background: #FAFAFA !important; }
        .btn-primary:hover { background: #1a1a1a !important; transform: translateY(-1px); }
        .btn-secondary:hover { background: #f5f5f5 !important; }
        .tag:hover { filter: brightness(0.95); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Tracker</h1>
          <p style={styles.subtitle}>Track applications, interviews & offers in one place</p>
        </div>
        <button className="btn-primary" style={styles.addBtn} onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...EMPTY_FORM }); }}>
          {showForm ? "✕ Close" : "+ New Application"}
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: "Total", value: stats.total, color: "#2D2D2D" },
          { label: "Applied", value: stats.applied, color: "#1565C0" },
          { label: "Interviewing", value: stats.interviewing, color: "#FF9800" },
          { label: "Accepted", value: stats.accepted, color: "#4CAF50" },
          { label: "Rejected", value: stats.rejected, color: "#EF5350" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Fraunces', serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div ref={formRef} style={{ ...styles.formCard, animation: "slideIn 0.3s ease" }}>
          <h2 style={styles.formTitle}>{editingId ? "Edit Application" : "Add New Application"}</h2>
          <div style={styles.formGrid}>
            <Field label="Company Name *" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} placeholder="e.g. Google" />
            <Field label="Team Name" value={form.teamName} onChange={(v) => setForm({ ...form, teamName: v })} placeholder="e.g. Cloud Platform" />
            <Field label="Role *" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="e.g. Software Engineer" />
            <Field label="Application Link" value={form.websiteLink} onChange={(v) => setForm({ ...form, websiteLink: v })} placeholder="https://..." type="url" />
            <Field label="Resume File Name" value={form.resumeFileName} onChange={(v) => setForm({ ...form, resumeFileName: v })} placeholder="resume_google_swe.pdf" />

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Cover Letter</label>
              <select style={styles.select} value={form.coverLetterType} onChange={(e) => setForm({ ...form, coverLetterType: e.target.value })}>
                <option value="none">No Cover Letter</option>
                <option value="file">PDF File Name</option>
                <option value="text">Paste Text</option>
              </select>
              {form.coverLetterType === "file" && (
                <input style={{ ...styles.input, marginTop: 8 }} value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} placeholder="cover_letter.pdf" />
              )}
              {form.coverLetterType === "text" && (
                <textarea style={{ ...styles.input, marginTop: 8, minHeight: 80, resize: "vertical" }} value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} placeholder="Paste cover letter text..." />
              )}
            </div>

            <SelectField label="Referral Given" value={form.referralGiven} onChange={(v) => setForm({ ...form, referralGiven: v })} options={["Yes", "No"]} />
            <SelectField label="Recruiter Outreach" value={form.recruiterOutreach} onChange={(v) => setForm({ ...form, recruiterOutreach: v })} options={["Yes", "No"]} />
            <Field label="Recruiter Contact" value={form.recruiterContact} onChange={(v) => setForm({ ...form, recruiterContact: v })} placeholder="Email or LinkedIn URL" />
            <Field label="Date Applied" value={form.dateApplied} onChange={(v) => setForm({ ...form, dateApplied: v })} type="date" />
            <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Applied", "Interviewing", "Accepted", "Rejected"]} />
            <SelectField label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["High", "Medium", "Low"]} />
            <Field label="Follow-up Date" value={form.followUpDate} onChange={(v) => setForm({ ...form, followUpDate: v })} type="date" />
            <Field label="Salary Range" value={form.salaryRange} onChange={(v) => setForm({ ...form, salaryRange: v })} placeholder="e.g. $150K - $180K" />
            <SelectField label="Interview Round" value={form.interviewRound} onChange={(v) => setForm({ ...form, interviewRound: v })} options={["", "Phone Screen", "Technical", "Behavioral", "System Design", "Final"]} />
            <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Notes</label>
              <textarea style={{ ...styles.input, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Interview feedback, observations..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btn-primary" style={styles.submitBtn} onClick={handleSubmit}>
              {editingId ? "Update Application" : "Save Application"}
            </button>
            <button className="btn-secondary" style={styles.cancelBtn} onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input style={styles.searchInput} placeholder="Search company or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
          <select style={styles.filterSelect} value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="dateApplied">Sort: Date</option>
            <option value="companyName">Sort: Company</option>
            <option value="status">Sort: Status</option>
            <option value="priority">Sort: Priority</option>
          </select>
          <button className="btn-secondary" style={styles.sortBtn} onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}>
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["table", "board"].map((v) => (
            <button key={v} className="btn-secondary" style={{ ...styles.viewBtn, ...(view === v ? styles.viewBtnActive : {}) }} onClick={() => setView(v)}>
              {v === "table" ? "☰ Table" : "▦ Board"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#666" }}>No applications yet</div>
          <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Click "New Application" to get started</div>
        </div>
      ) : view === "table" ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Company", "Role", "Status", "Priority", "Date Applied", "Referral", "Recruiter", "Follow-up", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="row-hover" style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{app.companyName}</div>
                    {app.teamName && <div style={{ fontSize: 12, color: "#888" }}>{app.teamName}</div>}
                  </td>
                  <td style={styles.td}>
                    <div>{app.role}</div>
                    {app.websiteLink && (
                      <a href={app.websiteLink} target="_blank" rel="noopener" style={{ fontSize: 12, color: "#1565C0", textDecoration: "none" }}>
                        View Posting ↗
                      </a>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span className="tag" style={{ ...styles.statusTag, background: STATUS_CONFIG[app.status]?.bg, color: STATUS_CONFIG[app.status]?.text }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_CONFIG[app.status]?.dot, display: "inline-block", marginRight: 6 }} />
                      {app.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span className="tag" style={{ ...styles.priorityTag, background: PRIORITY_CONFIG[app.priority]?.bg, color: PRIORITY_CONFIG[app.priority]?.text }}>
                      {app.priority}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: 13, color: "#555" }}>{app.dateApplied}</td>
                  <td style={styles.td}>
                    <span style={{ color: app.referralGiven === "Yes" ? "#4CAF50" : "#ccc", fontSize: 16 }}>
                      {app.referralGiven === "Yes" ? "✓" : "—"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {app.recruiterOutreach === "Yes" ? (
                      <div>
                        <span style={{ color: "#4CAF50", fontSize: 13 }}>✓ Reached out</span>
                        {app.recruiterContact && (
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {app.recruiterContact}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, fontSize: 13, color: app.followUpDate ? "#E65100" : "#ccc" }}>
                    {app.followUpDate || "—"}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary" style={styles.actionBtn} onClick={() => handleEdit(app)}>Edit</button>
                      <button className="btn-secondary" style={{ ...styles.actionBtn, color: "#C62828" }} onClick={() => handleDelete(app.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.boardContainer}>
          {Object.keys(STATUS_CONFIG).map((status) => {
            const items = filtered.filter((a) => a.status === status);
            return (
              <div key={status} style={styles.boardColumn}>
                <div style={styles.boardHeader}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CONFIG[status].dot }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{status}</span>
                  <span style={styles.boardCount}>{items.length}</span>
                </div>
                {items.map((app) => (
                  <div key={app.id} style={styles.boardCard} onClick={() => handleEdit(app)}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{app.companyName}</div>
                    {app.teamName && <div style={{ fontSize: 12, color: "#888" }}>{app.teamName}</div>}
                    <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{app.role}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {app.priority && (
                        <span style={{ ...styles.priorityTag, fontSize: 11, padding: "2px 8px", background: PRIORITY_CONFIG[app.priority]?.bg, color: PRIORITY_CONFIG[app.priority]?.text }}>
                          {app.priority}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#999" }}>{app.dateApplied}</span>
                    </div>
                    {app.referralGiven === "Yes" && <div style={{ fontSize: 11, color: "#4CAF50", marginTop: 4 }}>✓ Referral</div>}
                  </div>
                ))}
                {items.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#ccc", fontSize: 13 }}>No applications</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 0 8px", color: "#bbb", fontSize: 12 }}>
        {apps.length} application{apps.length !== 1 ? "s" : ""} tracked · Data stored in browser
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <select style={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o || "— Select —"}</option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
    background: "#FFFFFF",
    minHeight: "100vh",
    color: "#2D2D2D",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  addBtn: {
    background: "#2D2D2D",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 100px",
    background: "#FAFAFA",
    borderRadius: 10,
    padding: "16px 20px",
    transition: "all 0.2s",
    cursor: "default",
    minWidth: 100,
  },
  formCard: {
    background: "#FAFAFA",
    borderRadius: 12,
    padding: 28,
    marginBottom: 24,
    border: "1px solid #eee",
  },
  formTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    background: "#2D2D2D",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  cancelBtn: {
    background: "#fff",
    color: "#666",
    border: "1px solid #ddd",
    padding: "10px 24px",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  searchInput: {
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 13,
    width: 200,
    background: "#FAFAFA",
    transition: "all 0.2s",
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 13,
    background: "#FAFAFA",
    cursor: "pointer",
  },
  sortBtn: {
    background: "#FAFAFA",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 14,
  },
  viewBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
    transition: "all 0.2s",
  },
  viewBtnActive: {
    background: "#2D2D2D",
    color: "#fff",
    borderColor: "#2D2D2D",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: 12,
    border: "1px solid #eee",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #eee",
    background: "#FAFAFA",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f5f5f5",
    transition: "background 0.15s",
  },
  td: {
    padding: "12px 14px",
    fontSize: 14,
    verticalAlign: "top",
  },
  statusTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  priorityTag: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  actionBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  boardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    minHeight: 300,
  },
  boardColumn: {
    background: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    minHeight: 200,
  },
  boardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 4px 12px",
    borderBottom: "1px solid #eee",
    marginBottom: 12,
  },
  boardCount: {
    background: "#eee",
    borderRadius: 10,
    padding: "1px 8px",
    fontSize: 12,
    color: "#666",
    marginLeft: "auto",
  },
  boardCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    border: "1px solid #eee",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    background: "#FAFAFA",
    borderRadius: 12,
    border: "1px dashed #ddd",
  },
};
