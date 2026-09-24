import { useEffect, useState } from "react";
import axios from "axios";

import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarCheck,
  BarChart3,
  Plus,
  Search,
  RefreshCw,
  Mail,
  Menu,
  X
} from "lucide-react";

import "./App.css";

const API_URL = "http://127.0.0.1:5000";

/* ============================================================
   MAIN APP
============================================================ */

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [counsellors, setCounsellors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  /* ==========================================================
     FETCH DASHBOARD
  ========================================================== */

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/dashboard`
      );

      setDashboard(response.data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     FETCH LEADS
  ========================================================== */

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/leads`
      );

      setLeads(
        response.data?.data?.leads || []
      );
    } catch (error) {
      console.error("Leads error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     FETCH COUNSELLORS
  ========================================================== */

  const fetchCounsellors = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/counsellors`
      );

      setCounsellors(
        response.data?.data?.counsellors || []
      );
    } catch (error) {
      console.error("Counsellors error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchDashboard();
    fetchLeads();
    fetchCounsellors();
  }, []);

  /* ==========================================================
     PAGE CHANGE
  ========================================================== */

  const handlePageChange = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "dashboard") {
      fetchDashboard();
    }

    if (page === "leads") {
      fetchLeads();
    }

    if (page === "counsellors") {
      fetchCounsellors();
    }
  };

  /* ==========================================================
     AFTER LEAD CREATED
  ========================================================== */

  const handleLeadCreated = async () => {
    setShowAddLead(false);

    await Promise.all([
      fetchDashboard(),
      fetchLeads()
    ]);
  };

  /* ==========================================================
     AFTER LEAD UPDATED
  ========================================================== */

  const handleLeadUpdated = async () => {
    setSelectedLead(null);

    await Promise.all([
      fetchDashboard(),
      fetchLeads()
    ]);
  };

  /* ==========================================================
     REFRESH CURRENT PAGE
  ========================================================== */

  const handleRefresh = () => {
    if (activePage === "dashboard") {
      fetchDashboard();
    }

    if (activePage === "leads") {
      fetchLeads();
    }

    if (activePage === "counsellors") {
      fetchCounsellors();
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="app-container">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="brand">

          <div className="brand-icon">
            E
          </div>

          <div>
            <h2>EduLead</h2>
            <span>Admission CRM</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

        </div>

        {/* NAVIGATION */}

        <nav className="navigation">

          <NavItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active={activePage === "dashboard"}
            onClick={() =>
              handlePageChange("dashboard")
            }
          />

          <NavItem
            icon={<Users size={19} />}
            label="Leads"
            active={activePage === "leads"}
            onClick={() =>
              handlePageChange("leads")
            }
          />

          <NavItem
            icon={<CalendarCheck size={19} />}
            label="Follow-ups"
            active={activePage === "followups"}
            onClick={() =>
              handlePageChange("followups")
            }
          />

          <NavItem
            icon={<UserRound size={19} />}
            label="Counsellors"
            active={activePage === "counsellors"}
            onClick={() =>
              handlePageChange("counsellors")
            }
          />

          <NavItem
            icon={<BarChart3 size={19} />}
            label="Reports"
            active={activePage === "reports"}
            onClick={() =>
              handlePageChange("reports")
            }
          />

        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <div className="user-avatar">
            SC
          </div>

          <div>
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

        </div>

      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <h1>
              {getPageTitle(activePage)}
            </h1>

            <p>
              Manage your admission pipeline
            </p>
          </div>

          <div className="topbar-actions">

            <button
              className="refresh-button"
              onClick={handleRefresh}
            >
              <RefreshCw size={18} />
            </button>

            <button
              className="add-lead-button"
              onClick={() => setShowAddLead(true)}
            >
              <Plus size={18} />
              Add Lead
            </button>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <section className="page-content">

          {/* DASHBOARD */}

          {activePage === "dashboard" && (
            <Dashboard
              dashboard={dashboard}
              leads={leads}
              loading={loading}
            />
          )}

          {/* LEADS */}

          {activePage === "leads" && (
            <LeadsPage
              leads={leads}
              counsellors={counsellors}
              loading={loading}
              onAddLead={() =>
                setShowAddLead(true)
              }
              onLeadClick={(lead) =>
                setSelectedLead(lead)
              }
            />
          )}

          {/* COUNSELLORS */}

          {activePage === "counsellors" && (
            <CounsellorsPage
              counsellors={counsellors}
              loading={loading}
              onCounsellorCreated={async () => {
                await fetchCounsellors();
              }}
            />
          )}

          {/* FOLLOWUPS */}

          {activePage === "followups" && (
            <FollowupsPage 
              leads={leads}
              onRefreshDashboard={fetchDashboard}
            />
          )}

          {/* REPORTS */}

          {activePage === "reports" && (
            <ReportsPage
              dashboard={dashboard}
            />
          )}

        </section>

        {/* ADD LEAD MODAL */}

        {showAddLead && (
          <AddLeadModal
            onClose={() =>
              setShowAddLead(false)
            }
            onCreated={
              handleLeadCreated
            }
          />
        )}

        {/* LEAD DETAILS MODAL */}

        {selectedLead && (
          <LeadDetailsModal
            lead={selectedLead}
            counsellors={counsellors}
            onClose={() =>
              setSelectedLead(null)
            }
            onUpdated={
              handleLeadUpdated
            }
          />
        )}

      </main>

    </div>
  );
}


/* ============================================================
   NAV ITEM
============================================================ */

function NavItem({
  icon,
  label,
  active,
  onClick
}) {
  return (
    <button
      className={`nav-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


/* ============================================================
   PAGE TITLE
============================================================ */

function getPageTitle(page) {
  const titles = {
    dashboard: "Dashboard",
    leads: "Leads",
    followups: "Follow-ups",
    counsellors: "Counsellors",
    reports: "Reports"
  };

  return titles[page] || "EduLead";
}


/* ============================================================
   DASHBOARD
============================================================ */

function Dashboard({
  dashboard,
  leads,
  loading
}) {
  if (loading && !dashboard) {
    return (
      <div className="loading">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="empty-state">
        Unable to load dashboard.
      </div>
    );
  }

  const summary =
    dashboard.summary || {};

  const statuses =
    dashboard.status_distribution || [];

  return (
    <div>

      {/* KPI CARDS */}

      <div className="stats-grid">

        <StatCard
          title="Total Leads"
          value={
            summary.total_leads || 0
          }
          subtitle="All registered leads"
          icon={
            <Users size={21} />
          }
        />

        <StatCard
          title="Converted"
          value={
            summary.converted_leads || 0
          }
          subtitle="Successfully converted"
          icon={
            <UserRound size={21} />
          }
        />

        <StatCard
          title="Conversion Rate"
          value={`${summary.conversion_rate || 0}%`}
          subtitle="Overall conversion"
          icon={
            <BarChart3 size={21} />
          }
        />

        <StatCard
          title="Overdue Follow-ups"
          value={
            summary.overdue_followups || 0
          }
          subtitle="Needs attention"
          icon={
            <CalendarCheck size={21} />
          }
        />

      </div>

      {/* MAIN GRID */}

      <div className="dashboard-grid">

        {/* STATUS DISTRIBUTION */}

        <div className="card">

          <div className="card-header">

            <div>
              <h3>Lead Status</h3>
              <p>
                Current admission pipeline
              </p>
            </div>

          </div>

          <div className="status-list">

            {statuses.length === 0 ? (
              <div className="empty-state">
                No lead data available
              </div>
            ) : (
              statuses.map((item) => (
                <StatusRow
                  key={item.status}
                  status={item.status}
                  count={item.count}
                  total={summary.total_leads}
                />
              ))
            )}

          </div>

        </div>

        {/* RECENT LEADS */}

        <div className="card">

          <div className="card-header">

            <div>
              <h3>Recent Leads</h3>
              <p>
                Latest admission enquiries
              </p>
            </div>

            <span className="view-all">
              View all
            </span>

          </div>

          <div className="recent-leads">

            {leads.length === 0 ? (
              <div className="empty-state">
                No leads available
              </div>
            ) : (
              leads
                .slice(0, 5)
                .map((lead) => (
                  <div
                    className="lead-row"
                    key={lead.id}
                  >

                    <div className="lead-avatar">
                      {getInitials(
                        lead.student_name
                      )}
                    </div>

                    <div className="lead-info">
                      <strong>
                        {lead.student_name}
                      </strong>

                      <span>
                        {lead.lead_code}
                      </span>
                    </div>

                    <StatusBadge
                      status={lead.status}
                    />

                  </div>
                ))
            )}

          </div>

        </div>

      </div>

      {/* BOTTOM CARDS */}

      <div className="bottom-grid">

        <MiniMetric
          title="Total Follow-ups"
          value={
            summary.total_followups || 0
          }
          icon={
            <CalendarCheck size={20} />
          }
        />

        <MiniMetric
          title="Today's Follow-ups"
          value={
            summary.todays_followups || 0
          }
          icon={
            <CalendarCheck size={20} />
          }
        />

        <MiniMetric
          title="High Priority"
          value={getPriorityCount(
            dashboard.priority_distribution,
            "High"
          )}
          icon={
            <BarChart3 size={20} />
          }
        />

      </div>

    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  subtitle,
  icon
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-subtitle">
        {subtitle}
      </div>

    </div>
  );
}


/* ============================================================
   STATUS ROW
============================================================ */

function StatusRow({
  status,
  count,
  total
}) {
  const percentage =
    total > 0
      ? Math.round(
          (count / total) * 100
        )
      : 0;

  return (
    <div className="status-row">

      <div className="status-row-top">

        <span>{status}</span>

        <strong>{count}</strong>

      </div>

      <div className="progress">

        <div
          className="progress-bar"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>
  );
}

/* ============================================================
   PRIORITY COUNT
============================================================ */

function getPriorityCount(priorities, priority) {

  const item = (priorities || []).find(
    (entry) => entry.priority === priority
  );

  return item ? item.count : 0;
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status
}) {
  const className =
    status
      ?.toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("_", "-");

  return (
    <span
      className={`status-badge ${className || ""}`}
    >
      {status || "-"}
    </span>
  );
}


/* ============================================================
   LEADS PAGE
============================================================ */

function LeadsPage({
  leads,
  counsellors,
  loading,
  onAddLead,
  onLeadClick
}) {
  const [search, setSearch] =
    useState("");

  const filteredLeads =
    leads.filter((lead) => {

      const value =
        `${lead.student_name || ""} ${
          lead.lead_code || ""
        } ${
          lead.phone || ""
        } ${
          lead.email || ""
        }`
          .toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });

  return (
    <div>

      {/* TOOLBAR */}

      <div className="page-toolbar">

        <div className="search-box">

          <Search size={18} />

          <input
            placeholder="Search leads..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <button
          className="primary-button"
          onClick={onAddLead}
        >
          <Plus size={17} />
          Add Lead
        </button>

      </div>

      {/* TABLE */}

      <div className="card table-card">

        {loading ? (
          <div className="loading">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="empty-state">
            No leads found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Lead</th>
                  <th>Student</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Counsellor</th>
                </tr>

              </thead>

              <tbody>

                {filteredLeads.map(
                  (lead) => (

                    <tr
                      key={lead.id}
                      className="clickable-row"
                      onClick={() =>
                        onLeadClick(lead)
                      }
                    >

                      <td>
                        <strong>
                          {lead.lead_code}
                        </strong>
                      </td>

                      <td>

                        <div className="student-cell">

                          <div className="small-avatar">
                            {getInitials(
                              lead.student_name
                            )}
                          </div>

                          <span>
                            {lead.student_name}
                          </span>

                        </div>

                      </td>

                      <td>
                        {lead.phone}
                      </td>

                      <td>
                        {lead.source}
                      </td>

                      <td>
                        <PriorityBadge
                          priority={
                            lead.priority
                          }
                        />
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            lead.status
                          }
                        />
                      </td>

                      <td>
                        {lead.counsellor_id
                          ? getCounsellorName(
                              counsellors || [],
                              lead.counsellor_id
                            )
                          : "Unassigned"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


/* ============================================================
   ADD LEAD MODAL
============================================================ */

function AddLeadModal({
  onClose,
  onCreated
}) {
  const [form, setForm] =
    useState({
      student_name: "",
      phone: "",
      email: "",
      course_id: 1,
      source: "Website",
      priority: "Medium",
      status: "New"
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /* VALIDATION */

    if (!form.student_name.trim()) {
      setError(
        "Student name is required."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Phone number is required."
      );
      return;
    }

    if (
      form.phone.trim().length < 10
    ) {
      setError(
        "Please enter a valid phone number."
      );
      return;
    }

    try {

      setSaving(true);

      /* CREATE LEAD */

      const response =
        await axios.post(
          `${API_URL}/api/leads`,
          {
            student_name:
              form.student_name.trim(),

            phone:
              form.phone.trim(),

            email:
              form.email.trim(),

            course_id:
              Number(form.course_id),

            source:
              form.source,

            priority:
              form.priority,

            status:
              form.status
          }
        );

      if (
        response.data &&
        response.data.success === false
      ) {
        setError(
          response.data.message ||
          "Unable to create lead."
        );
        return;
      }

      onCreated();

    } catch (error) {

      console.error(
        "Create lead error:",
        error
      );

      const apiMessage =
        error.response?.data?.message;

      const apiError =
        error.response?.data?.error;

      if (apiMessage) {

        setError(apiMessage);

      } else if (
        typeof apiError === "string"
      ) {

        setError(apiError);

      } else {

        setError(
          "Unable to create lead. Please check that the Flask backend is running."
        );
      }

    } finally {

      setSaving(false);

    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="lead-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <h2>
              Add New Lead
            </h2>

            <p>
              Create a new admission enquiry
            </p>

          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        <form
          className="lead-form"
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            <div className="form-field full">

              <label>
                Student Name *
              </label>

              <input
                type="text"
                name="student_name"
                placeholder="Enter student name"
                value={
                  form.student_name
                }
                onChange={
                  handleChange
                }
                autoFocus
              />

            </div>

            <div className="form-field">

              <label>
                Phone *
              </label>

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                maxLength={15}
              />

            </div>

            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="form-field">

              <label>
                Course ID
              </label>

              <input
                type="number"
                name="course_id"
                min="1"
                value={
                  form.course_id
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="form-field">

              <label>
                Source
              </label>

              <select
                name="source"
                value={
                  form.source
                }
                onChange={
                  handleChange
                }
              >

                <option value="Website">
                  Website
                </option>

                <option value="Walk-in">
                  Walk-in
                </option>

                <option value="Referral">
                  Referral
                </option>

                <option value="Social Media">
                  Social Media
                </option>

                <option value="Advertisement">
                  Advertisement
                </option>

              </select>

            </div>

            <div className="form-field">

              <label>
                Priority
              </label>

              <select
                name="priority"
                value={
                  form.priority
                }
                onChange={
                  handleChange
                }
              >

                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>

              </select>

            </div>

            <div className="form-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  handleChange
                }
              >

                <option value="New">
                  New
                </option>

                <option value="Contacted">
                  Contacted
                </option>

                <option value="Interested">
                  Interested
                </option>

                <option value="Follow-up Required">
                  Follow-up Required
                </option>

                <option value="Application Started">
                  Application Started
                </option>

                <option value="Application Submitted">
                  Application Submitted
                </option>

              </select>

            </div>

          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Lead"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* ============================================================
   LEAD DETAILS MODAL
============================================================ */

function LeadDetailsModal({
  lead,
  counsellors,
  onClose,
  onUpdated
}) {
  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      student_name:
        lead.student_name || "",

      phone:
        lead.phone || "",

      email:
        lead.email || "",

      source:
        lead.source || "Website",

      priority:
        lead.priority || "Medium",

      status:
        lead.status || "New",

      counsellor_id:
        lead.counsellor_id || ""
    });

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value
      })
    );
  };

  const handleSave = async () => {

    setError("");

    if (!form.student_name.trim()) {
      setError(
        "Student name is required."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Phone number is required."
      );
      return;
    }

    try {

      setSaving(true);

      const response =
        await axios.put(
          `${API_URL}/api/leads/${lead.id}`,
          {
            student_name:
              form.student_name.trim(),

            phone:
              form.phone.trim(),

            email:
              form.email.trim(),

            source:
              form.source,

            priority:
              form.priority,

            status:
              form.status,

            counsellor_id:
              form.counsellor_id
                ? Number(
                    form.counsellor_id
                  )
                : null
          }
        );

      if (
        response.data &&
        response.data.success === false
      ) {
        setError(
          response.data.message ||
          "Unable to update lead."
        );
        return;
      }

      await onUpdated();

    } catch (error) {

      console.error(
        "Update lead error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to update lead."
      );

    } finally {

      setSaving(false);

    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="lead-modal details-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="modal-header">

          <div>

            <h2>
              {editing
                ? "Edit Lead"
                : "Lead Details"}
            </h2>

            <p>
              {lead.lead_code}
            </p>

          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        <div className="lead-form">

          {!editing ? (

            <>
              {/* PROFILE */}

              <div className="lead-profile">

                <div className="large-lead-avatar">
                  {getInitials(
                    lead.student_name
                  )}
                </div>

                <div>

                  <h2>
                    {lead.student_name}
                  </h2>

                  <p>
                    {lead.lead_code}
                  </p>

                </div>

              </div>

              {/* DETAILS */}

              <div className="details-grid">

                <DetailItem
                  label="Phone"
                  value={
                    lead.phone || "-"
                  }
                />

                <DetailItem
                  label="Email"
                  value={
                    lead.email || "-"
                  }
                />

                <DetailItem
                  label="Source"
                  value={
                    lead.source || "-"
                  }
                />

                <DetailItem
                  label="Course ID"
                  value={
                    lead.course_id || "-"
                  }
                />

                <DetailItem
                  label="Priority"
                  value={
                    lead.priority || "-"
                  }
                />

                <DetailItem
                  label="Status"
                  value={
                    lead.status || "-"
                  }
                />

                <DetailItem
                  label="Counsellor"
                  value={
                    lead.counsellor_id
                      ? getCounsellorName(
                          counsellors,
                          lead.counsellor_id
                        )
                      : "Unassigned"
                  }
                />

                <DetailItem
                  label="Created"
                  value={
                    lead.created_at || "-"
                  }
                />

                <DetailItem
                  label="Updated"
                  value={
                    lead.updated_at || "-"
                  }
                />

              </div>

              {/* STATUS */}

              <div className="lead-status-section">

                <div>

                  <span>
                    Current Status
                  </span>

                  <StatusBadge
                    status={
                      lead.status
                    }
                  />

                </div>

                <div>

                  <span>
                    Priority
                  </span>

                  <PriorityBadge
                    priority={
                      lead.priority
                    }
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={onClose}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    setEditing(true)
                  }
                >
                  Edit Lead
                </button>

              </div>

            </>

          ) : (

            <>
              {/* EDIT FORM */}

              <div className="form-grid">

                <div className="form-field full">

                  <label>
                    Student Name *
                  </label>

                  <input
                    type="text"
                    name="student_name"
                    value={
                      form.student_name
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="form-field">

                  <label>
                    Phone *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={15}
                  />

                </div>

                <div className="form-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="form-field">

                  <label>
                    Source
                  </label>

                  <select
                    name="source"
                    value={
                      form.source
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Website">
                      Website
                    </option>

                    <option value="Walk-in">
                      Walk-in
                    </option>

                    <option value="Referral">
                      Referral
                    </option>

                    <option value="Social Media">
                      Social Media
                    </option>

                    <option value="Advertisement">
                      Advertisement
                    </option>

                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>

                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="New">
                      New
                    </option>

                    <option value="Contacted">
                      Contacted
                    </option>

                    <option value="Interested">
                      Interested
                    </option>

                    <option value="Follow-up Required">
                      Follow-up Required
                    </option>

                    <option value="Application Started">
                      Application Started
                    </option>

                    <option value="Application Submitted">
                      Application Submitted
                    </option>

                    <option value="Converted">
                      Converted
                    </option>

                    <option value="Lost">
                      Lost
                    </option>

                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Counsellor
                  </label>

                  <select
                    name="counsellor_id"
                    value={
                      form.counsellor_id
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {counsellors.map(
                      (counsellor) => (
                        <option
                          key={
                            counsellor.id
                          }
                          value={
                            counsellor.id
                          }
                        >
                          {
                            counsellor.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => {
                    setError("");
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  label,
  value
}) {
  return (
    <div className="detail-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* ============================================================
   COUNSELLOR NAME
============================================================ */

function getCounsellorName(
  counsellors,
  id
) {
  const counsellor =
    counsellors.find(
      (item) =>
        Number(item.id) ===
        Number(id)
    );

  return counsellor
    ? counsellor.name
    : `Counsellor #${id}`;
}


/* ============================================================
   COUNSELLORS PAGE
============================================================ */

function CounsellorsPage({
  counsellors,
  loading,
  onCounsellorCreated
}) {
  const [showAddCounsellor, setShowAddCounsellor] =
    useState(false);

  const handleCreated = async () => {
    setShowAddCounsellor(false);
    await onCounsellorCreated();
  };

  return (
    <div>

      <div className="page-toolbar">

        <div>
          <h2 className="section-title">
            Counsellors
          </h2>

          <p className="section-description">
            Manage admission counsellors
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowAddCounsellor(true)}
        >
          <Plus size={17} />
          Add Counsellor
        </button>

      </div>


      {loading ? (

        <div className="loading">
          Loading counsellors...
        </div>

      ) : (

        <div className="counsellor-grid">

          {counsellors.length === 0 ? (

            <div className="card empty-state">
              No counsellors found.
            </div>

          ) : (

            counsellors.map((counsellor) => (

              <div
                className="counsellor-card"
                key={counsellor.id}
              >

                <div className="counsellor-avatar">
                  {getInitials(counsellor.name)}
                </div>

                <h3>
                  {counsellor.name}
                </h3>

                <p>
                  {counsellor.email}
                </p>

                <span className="active-badge">
                  Active
                </span>

                <div className="counsellor-contact">

                  <span>
                    <Mail size={15} />
                    {counsellor.email}
                  </span>

                  <span>
                    <UserRound size={15} />
                    Counsellor
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

      )}


      {showAddCounsellor && (

        <AddCounsellorModal
          onClose={() =>
            setShowAddCounsellor(false)
          }
          onCreated={handleCreated}
        />

      )}

    </div>
  );
}

function AddCounsellorModal({
  onClose,
  onCreated
}) {
  const [form, setForm] = useState({
    name: "",
    email: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Counsellor name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        `${API_URL}/api/counsellors`,
        {
          name: form.name.trim(),
          email: form.email.trim()
        }
      );

      if (
        response.data &&
        response.data.success === false
      ) {
        setError(
          response.data.message ||
          "Unable to create counsellor."
        );
        return;
      }

      await onCreated();

    } catch (error) {

      console.error(
        "Create counsellor error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to create counsellor."
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="lead-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>
            <h2>
              Add Counsellor
            </h2>

            <p>
              Create a new admission counsellor
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>


        <form
          className="lead-form"
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            <div className="form-field full">

              <label>
                Counsellor Name *
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter counsellor name"
                value={form.name}
                onChange={handleChange}
                autoFocus
              />

            </div>


            <div className="form-field full">

              <label>
                Email *
              </label>

              <input
                type="email"
                name="email"
                placeholder="counsellor@example.com"
                value={form.email}
                onChange={handleChange}
              />

            </div>

          </div>


          {error && (
            <div className="form-error">
              {error}
            </div>
          )}


          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Counsellor"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* ============================================================
   FOLLOWUPS PAGE
============================================================ */

function FollowupsPage({
  leads,
  onRefreshDashboard
}) {

  const [selectedLeadId, setSelectedLeadId] =
    useState("");

  const [followups, setFollowups] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [showAddFollowup, setShowAddFollowup] =
    useState(false);

  const [error, setError] =
    useState("");


  /* ============================================================
     SELECTED LEAD
  ============================================================ */

  const selectedLead = leads.find(
    (lead) =>
      String(lead.id) ===
      String(selectedLeadId)
  );


  /* ============================================================
     FETCH FOLLOW-UP HISTORY
  ============================================================ */

  const fetchFollowups = async (leadId) => {

    if (!leadId) {

      setFollowups([]);

      return;
    }


    try {

      setLoading(true);

      setError("");


      const response = await axios.get(
        `${API_URL}/api/leads/${leadId}/followups`
      );


      if (
        response.data &&
        response.data.success
      ) {

        setFollowups(
          response.data?.data?.followups || []
        );

      } else {

        setFollowups([]);

      }

    } catch (error) {

      console.error(
        "Follow-ups error:",
        error
      );

      setFollowups([]);

      setError(
        error.response?.data?.message ||
        "Unable to load follow-ups."
      );

    } finally {

      setLoading(false);

    }

  };


  /* ============================================================
     LEAD SELECTION
  ============================================================ */

  const handleLeadChange = async (e) => {

    const leadId = e.target.value;

    setSelectedLeadId(leadId);

    setError("");

    await fetchFollowups(leadId);

  };


  /* ============================================================
     AFTER FOLLOW-UP CREATED
  ============================================================ */

  const handleFollowupCreated = async () => {

    setShowAddFollowup(false);

    await fetchFollowups(
      selectedLeadId
    );


    if (onRefreshDashboard) {

      await onRefreshDashboard();

    }

  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (

    <div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="page-toolbar">

        <div>

          <h2 className="section-title">
            Follow-ups
          </h2>

          <p className="section-description">
            Track and manage student interactions
          </p>

        </div>


        <button
          type="button"
          className="primary-button"
          disabled={!selectedLeadId}
          onClick={() =>
            setShowAddFollowup(true)
          }
        >

          <Plus size={17} />

          Add Follow-up

        </button>

      </div>


      {/* ======================================================
          LEAD SELECTOR
      ====================================================== */}

      <div className="card">

        <div className="form-field">

          <label>
            Select Lead
          </label>


          <select
            value={selectedLeadId}
            onChange={handleLeadChange}
          >

            <option value="">
              Select a lead
            </option>


            {leads.map((lead) => (

              <option
                key={lead.id}
                value={lead.id}
              >

                {lead.student_name}
                {" - "}
                {lead.lead_code}

              </option>

            ))}

          </select>

        </div>

      </div>


      {/* ======================================================
          SELECTED LEAD INFORMATION
      ====================================================== */}

      {selectedLead && (

        <div className="card followup-lead-info">

          <div>

            <strong>
              {selectedLead.student_name}
            </strong>

            <span>
              {selectedLead.lead_code}
            </span>

          </div>


          <div>

            <span>
              Status: {selectedLead.status}
            </span>

          </div>

        </div>

      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="form-error">
          {error}
        </div>

      )}


      {/* ======================================================
          NO LEAD SELECTED
      ====================================================== */}

      {!selectedLeadId ? (

        <div className="card empty-state large-empty">

          <CalendarCheck size={40} />

          <h3>
            Select a lead
          </h3>

          <p>
            Select a lead above to view its
            follow-up history.
          </p>

        </div>


      ) : loading ? (

        /* ====================================================
           LOADING
        ==================================================== */

        <div className="loading">
          Loading follow-ups...
        </div>


      ) : followups.length === 0 ? (

        /* ====================================================
           NO FOLLOW-UPS
        ==================================================== */

        <div className="card empty-state large-empty">

          <CalendarCheck size={40} />

          <h3>
            No follow-ups yet
          </h3>

          <p>
            Add the first follow-up for this lead.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              setShowAddFollowup(true)
            }
          >

            <Plus size={17} />

            Add Follow-up

          </button>

        </div>


      ) : (

        /* ====================================================
           FOLLOW-UP HISTORY
        ==================================================== */

        <div className="followup-list">

          {followups.map((followup) => (

            <div
              className="card followup-card"
              key={followup.id}
            >


              {/* FOLLOW-UP HEADER */}

              <div className="followup-header">

                <div>

                  <strong>
                    {followup.method}
                  </strong>

                  <span>
                    {followup.followup_date}
                  </span>

                </div>


                {followup.next_followup_date && (

                  <span className="followup-next">

                    Next:
                    {" "}
                    {followup.next_followup_date}

                  </span>

                )}

              </div>


              {/* OUTCOME */}

              {followup.outcome && (

                <div className="followup-section">

                  <strong>
                    Outcome
                  </strong>

                  <p>
                    {followup.outcome}
                  </p>

                </div>

              )}


              {/* NOTES */}

              {followup.notes && (

                <div className="followup-section">

                  <strong>
                    Notes
                  </strong>

                  <p>
                    {followup.notes}
                  </p>

                </div>

              )}


              {/* CREATED DATE */}

              {followup.created_at && (

                <div className="followup-created">

                  Created:
                  {" "}
                  {followup.created_at}

                </div>

              )}

            </div>

          ))}

        </div>

      )}


      {/* ======================================================
          ADD FOLLOW-UP MODAL
      ====================================================== */}

      {showAddFollowup && (

        <AddFollowupModal

          lead={selectedLead}

          onClose={() =>
            setShowAddFollowup(false)
          }

          onCreated={
            handleFollowupCreated
          }

        />

      )}

    </div>

  );

}


/* ============================================================
   ADD FOLLOW-UP MODAL
============================================================ */

function AddFollowupModal({
  lead,
  onClose,
  onCreated
}) {


  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const [form, setForm] =
    useState({

      method: "Call",

      outcome: "",

      notes: "",

      followup_date: today,

      next_followup_date: ""

    });


  const [saving, setSaving] =
    useState(false);


  const [error, setError] =
    useState("");


  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm(
      (previous) => ({

        ...previous,

        [name]: value

      })
    );

  };


  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    /* REQUIRED METHOD */

    if (!form.method) {

      setError(
        "Follow-up method is required."
      );

      return;

    }


    /* REQUIRED DATE */

    if (!form.followup_date) {

      setError(
        "Follow-up date is required."
      );

      return;

    }


    if (!lead) {

      setError(
        "Please select a lead first."
      );

      return;

    }


    try {

      setSaving(true);


      const response =
        await axios.post(

          `${API_URL}/api/leads/${lead.id}/followups`,

          {

            method:
              form.method,

            outcome:
              form.outcome.trim()
                ? form.outcome.trim()
                : null,

            notes:
              form.notes.trim()
                ? form.notes.trim()
                : null,

            followup_date:
              form.followup_date,

            next_followup_date:
              form.next_followup_date
                ? form.next_followup_date
                : null

          }

        );


      if (
        response.data &&
        response.data.success === false
      ) {

        setError(

          response.data.message ||
          "Unable to create follow-up."

        );

        return;

      }


      await onCreated();


    } catch (error) {

      console.error(
        "Create follow-up error:",
        error
      );


      setError(

        error.response?.data?.message ||
        "Unable to create follow-up."

      );

    } finally {

      setSaving(false);

    }

  };


  /* ==========================================================
     MODAL UI
  ========================================================== */

  return (

    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="lead-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >


        {/* HEADER */}

        <div className="modal-header">

          <div>

            <h2>
              Add Follow-up
            </h2>

            <p>

              {lead?.student_name}

              {" - "}

              {lead?.lead_code}

            </p>

          </div>


          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={saving}
          >

            <X size={20} />

          </button>

        </div>


        {/* FORM */}

        <form
          className="lead-form"
          onSubmit={handleSubmit}
        >


          <div className="form-grid">


            {/* METHOD */}

            <div className="form-field">

              <label>
                Method *
              </label>


              <select
                name="method"
                value={form.method}
                onChange={handleChange}
              >

                <option value="Call">
                  Call
                </option>

                <option value="WhatsApp">
                  WhatsApp
                </option>

                <option value="Email">
                  Email
                </option>

                <option value="Meeting">
                  Meeting
                </option>

                <option value="Campus Visit">
                  Campus Visit
                </option>

              </select>

            </div>


            {/* FOLLOW-UP DATE */}

            <div className="form-field">

              <label>
                Follow-up Date *
              </label>


              <input
                type="date"
                name="followup_date"
                value={form.followup_date}
                onChange={handleChange}
              />

            </div>


            {/* NEXT FOLLOW-UP DATE */}

            <div className="form-field">

              <label>
                Next Follow-up Date
              </label>


              <input
                type="date"
                name="next_followup_date"
                value={
                  form.next_followup_date
                }
                onChange={handleChange}
              />

            </div>


            {/* OUTCOME */}

            <div className="form-field full">

              <label>
                Outcome
              </label>


              <input
                type="text"
                name="outcome"
                placeholder="e.g. Student is interested"
                value={form.outcome}
                onChange={handleChange}
              />

            </div>


            {/* NOTES */}

            <div className="form-field full">

              <label>
                Notes
              </label>


              <textarea
                name="notes"
                rows="4"
                placeholder="Enter follow-up notes..."
                value={form.notes}
                onChange={handleChange}
              />

            </div>


          </div>


          {/* ERROR */}

          {error && (

            <div className="form-error">
              {error}
            </div>

          )}


          {/* ACTIONS */}

          <div className="modal-actions">


            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >

              Cancel

            </button>


            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "Save Follow-up"}

            </button>


          </div>


        </form>

      </div>

    </div>

  );

}

/* ============================================================
   REPORTS PAGE
============================================================ */

function ReportsPage({
  dashboard
}) {

  if (!dashboard) {

    return (
      <div className="loading">
        Loading reports...
      </div>
    );

  }

  const summary =
    dashboard.summary || {};

  const statuses =
    dashboard.status_distribution || [];

  const sources =
    dashboard.source_distribution || [];

  const priorities =
    dashboard.priority_distribution || [];

  const totalLeads =
    summary.total_leads || 0;


  return (

    <div>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-toolbar">

        <div>

          <h2 className="section-title">
            Reports
          </h2>

          <p className="section-description">
            Admission performance and lead analytics
          </p>

        </div>

      </div>


      {/* ======================================================
          SUMMARY METRICS
      ====================================================== */}

      <div className="stats-grid">

        <StatCard
          title="Total Leads"
          value={
            summary.total_leads || 0
          }
          subtitle="All registered leads"
          icon={
            <Users size={21} />
          }
        />


        <StatCard
          title="Converted Leads"
          value={
            summary.converted_leads || 0
          }
          subtitle="Successfully converted"
          icon={
            <UserRound size={21} />
          }
        />


        <StatCard
          title="Conversion Rate"
          value={
            `${summary.conversion_rate || 0}%`
          }
          subtitle="Overall conversion"
          icon={
            <BarChart3 size={21} />
          }
        />


        <StatCard
          title="Total Follow-ups"
          value={
            summary.total_followups || 0
          }
          subtitle="Recorded interactions"
          icon={
            <CalendarCheck size={21} />
          }
        />

      </div>


      {/* ======================================================
          FOLLOW-UP SUMMARY
      ====================================================== */}

      <div className="bottom-grid">

        <MiniMetric
          title="Overdue Follow-ups"
          value={
            summary.overdue_followups || 0
          }
          icon={
            <CalendarCheck size={20} />
          }
        />


        <MiniMetric
          title="Today's Follow-ups"
          value={
            summary.todays_followups || 0
          }
          icon={
            <CalendarCheck size={20} />
          }
        />


        <MiniMetric
          title="High Priority Leads"
          value={
            getPriorityCount(
              priorities,
              "High"
            )
          }
          icon={
            <BarChart3 size={20} />
          }
        />

      </div>


      {/* ======================================================
          REPORT GRIDS
      ====================================================== */}

      <div className="dashboard-grid">


        {/* ====================================================
            LEAD STATUS
        ==================================================== */}

        <div className="card">

          <div className="card-header">

            <div>

              <h3>
                Lead Status
              </h3>

              <p>
                Current admission pipeline
              </p>

            </div>

          </div>


          <div className="status-list">

            {statuses.length === 0 ? (

              <div className="empty-state">
                No lead status data available
              </div>

            ) : (

              statuses.map(
                (item) => (

                  <StatusRow
                    key={
                      item.status
                    }
                    status={
                      item.status
                    }
                    count={
                      item.count
                    }
                    total={
                      totalLeads
                    }
                  />

                )
              )

            )}

          </div>

        </div>


        {/* ====================================================
            LEADS BY SOURCE
        ==================================================== */}

        <div className="card">

          <div className="card-header">

            <div>

              <h3>
                Leads by Source
              </h3>

              <p>
                Where admission enquiries come from
              </p>

            </div>

          </div>


          <div className="status-list">

            {sources.length === 0 ? (

              <div className="empty-state">
                No source data available
              </div>

            ) : (

              sources.map(
                (item) => (

                  <StatusRow
                    key={
                      item.source
                    }
                    status={
                      item.source
                    }
                    count={
                      item.count
                    }
                    total={
                      totalLeads
                    }
                  />

                )
              )

            )}

          </div>

        </div>


        {/* ====================================================
            LEADS BY PRIORITY
        ==================================================== */}

        <div className="card">

          <div className="card-header">

            <div>

              <h3>
                Leads by Priority
              </h3>

              <p>
                Current priority distribution
              </p>

            </div>

          </div>


          <div className="status-list">

            {priorities.length === 0 ? (

              <div className="empty-state">
                No priority data available
              </div>

            ) : (

              priorities.map(
                (item) => (

                  <StatusRow
                    key={
                      item.priority
                    }
                    status={
                      item.priority
                    }
                    count={
                      item.count
                    }
                    total={
                      totalLeads
                    }
                  />

                )
              )

            )}

          </div>

        </div>


        {/* ====================================================
            CONVERSION SUMMARY
        ==================================================== */}

        <div className="card">

          <div className="card-header">

            <div>

              <h3>
                Conversion Summary
              </h3>

              <p>
                Lead conversion overview
              </p>

            </div>

          </div>


          <div className="report-summary-list">

            <div className="report-summary-row">

              <span>
                Total Leads
              </span>

              <strong>
                {summary.total_leads || 0}
              </strong>

            </div>


            <div className="report-summary-row">

              <span>
                Converted Leads
              </span>

              <strong>
                {summary.converted_leads || 0}
              </strong>

            </div>


            <div className="report-summary-row">

              <span>
                Conversion Rate
              </span>

              <strong>
                {summary.conversion_rate || 0}%
              </strong>

            </div>


            <div className="report-summary-row">

              <span>
                Total Follow-ups
              </span>

              <strong>
                {summary.total_followups || 0}
              </strong>

            </div>


            <div className="report-summary-row">

              <span>
                Overdue Follow-ups
              </span>

              <strong>
                {summary.overdue_followups || 0}
              </strong>

            </div>


            <div className="report-summary-row">

              <span>
                Today's Follow-ups
              </span>

              <strong>
                {summary.todays_followups || 0}
              </strong>

            </div>

          </div>

        </div>


      </div>


      {/* ======================================================
          DATA SUMMARY
      ====================================================== */}

      <div className="card report-footer-card">

        <div className="card-header">

          <div>

            <h3>
              Report Summary
            </h3>

            <p>
              Current data available in EduLead
            </p>

          </div>

        </div>


        <div className="report-summary-grid">

          <div>

            <span>
              Status Categories
            </span>

            <strong>
              {statuses.length}
            </strong>

          </div>


          <div>

            <span>
              Lead Sources
            </span>

            <strong>
              {sources.length}
            </strong>

          </div>


          <div>

            <span>
              Priority Categories
            </span>

            <strong>
              {priorities.length}
            </strong>

          </div>


          <div>

            <span>
              Conversion Rate
            </span>

            <strong>
              {summary.conversion_rate || 0}%
            </strong>

          </div>

        </div>

      </div>

    </div>

  );

}
/* ============================================================
   MINI METRIC
============================================================ */

function MiniMetric({
  title,
  value,
  icon
}) {
  return (
    <div className="mini-metric">

      <div className="mini-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* ============================================================
   PRIORITY BADGE
============================================================ */

function PriorityBadge({
  priority
}) {
  return (
    <span
      className={`priority-badge ${
        priority?.toLowerCase() || ""
      }`}
    >
      {priority || "-"}
    </span>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function getInitials(
  name = ""
) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0].toUpperCase()
    )
    .join("");
}




/* ============================================================
   EXPORT APP
============================================================ */

export default App;
