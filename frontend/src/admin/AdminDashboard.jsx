
import { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api";

function AdminDashboard() {

    const [token] = useState(
        () => localStorage.getItem("token") || ""
    );

    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [activeSection, setActiveSection] = useState("overview");
    const [processingId, setProcessingId] = useState("");

    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    // Load recipient applications
    const loadApplications = useCallback(async () => {

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/recipient-verification/admin/applications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not load applications."
                );
            }

            setApplications(data.applications || []);
            setMessage("");

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }

    }, [token]);

    // Check admin login
    useEffect(() => {

        if (!token || !user || user.role !== "Admin") {
            window.location.replace("/login");
            return;
        }

        loadApplications();

    }, [token, user, loadApplications]);

    // Update application status
    const updateApplication = async (id, action) => {

        let adminNote = "";

        if (action === "request-info" || action === "reject") {

            adminNote = window.prompt(
                action === "reject"
                    ? "Enter the reason for rejection:"
                    : "What additional information is required?"
            );

            if (adminNote === null) return;

            if (!adminNote.trim()) {
                setMessage("Please enter a note.");
                return;
            }
        }

        setProcessingId(id);
        setMessage("");

        try {

            const response = await fetch(
                `${API_URL}/recipient-verification/admin/${id}/${action}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ adminNote })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Action failed.");
            }

            setMessage(data.message);
            await loadApplications();

        } catch (error) {
            setMessage(error.message);
        } finally {
            setProcessingId("");
        }
    };

    // Logout
    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    // Dashboard statistics
    const totalApplications = applications.length;

    const pendingCount = applications.filter(
        (a) => a.status === "Pending"
    ).length;

    const approvedCount = applications.filter(
        (a) => a.status === "Approved"
    ).length;

    const rejectedCount = applications.filter(
        (a) => a.status === "Rejected"
    ).length;

    const moreInfoCount = applications.filter(
        (a) => a.status === "Needs More Information"
    ).length;

    // Filter applications
    const filteredApplications =
        filterStatus === "All"
            ? applications
            : applications.filter(
                (application) => application.status === filterStatus
            );

    const filters = [
        "All",
        "Pending",
        "Approved",
        "Rejected",
        "Needs More Information"
    ];

    // Navigation
    const navigateTo = (section) => {
        setActiveSection(section);

        if (section === "applications") {
            setFilterStatus("All");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Main dashboard
    return (

        <div className="admin-dashboard">

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <div className="admin-brand">
                    <h2>Save<span>Bite</span></h2>
                    <p>ADMIN PANEL</p>
                </div>

                <div className="admin-profile">
                    <div className="admin-avatar">
                        A
                    </div>

                    <div>
                        <h3>Administrator</h3>
                        <p>System Manager</p>
                    </div>
                </div>

                <nav className="admin-navigation">

                    <p className="admin-nav-label">MENU</p>

                    <button
                        className={activeSection === "overview" ? "admin-nav-active" : ""}
                        onClick={() => navigateTo("overview")}
                    >
                        <span>⌂</span>
                        Overview
                    </button>

                    <button
                        className={activeSection === "applications" ? "admin-nav-active" : ""}
                        onClick={() => navigateTo("applications")}
                    >
                        <span>▤</span>
                        Recipient Applications
                        {pendingCount > 0 && (
                            <span className="admin-nav-count">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">

                    <div className="admin-sidebar-note">
                        <span>♥</span>
                        <p>
                            Making surplus food useful,
                            one connection at a time.
                        </p>
                    </div>

                    <button
                        className="admin-logout-btn"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* Main Content */}
            <main className="admin-main">

                {/* Top Bar */}
                <header className="admin-topbar">

                    <div>
                        <p className="admin-breadcrumb">
                            SaveBite / Admin
                        </p>

                        <h1>
                            {activeSection === "overview"
                                ? "Dashboard Overview"
                                : "Recipient Applications"}
                        </h1>
                    </div>

                    <button
                        className="admin-refresh-btn"
                        onClick={loadApplications}
                        disabled={loading}
                    >
                        ↻ {loading ? "Refreshing..." : "Refresh"}
                    </button>

                </header>

                {/* Feedback Message */}
                {message && (
                    <div className="admin-message">
                        {message}
                    </div>
                )}

                {/* Overview Section */}
                {activeSection === "overview" && (

                    <>

                        <section className="admin-welcome">

                            <div>
                                <p>WELCOME BACK, ADMIN</p>

                                <h2>
                                    Manage your community
                                    <br />
                                    with SaveBite.
                                </h2>

                                <p>
                                    Review recipient applications and help
                                    connect surplus food with people who need it.
                                </p>
                            </div>

                            <div className="admin-welcome-icon">
                                <span>♥</span>
                                <p>Food for everyone</p>
                            </div>

                        </section>

                        {/* Statistics */}
                        <section className="admin-stats-section">

                            <div className="admin-section-heading">
                                <div>
                                    <h2>Platform Overview</h2>
                                    <p>Recipient verification statistics</p>
                                </div>
                            </div>

                            <div className="admin-summary">

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon total-icon">
                                        ▤
                                    </div>
                                    <p>Total Applications</p>
                                    <h3>{totalApplications}</h3>
                                    <span>All received applications</span>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon pending-icon">
                                        ◷
                                    </div>
                                    <p>Pending Review</p>
                                    <h3>{pendingCount}</h3>
                                    <span>Awaiting admin action</span>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon approved-icon">
                                        ✓
                                    </div>
                                    <p>Approved</p>
                                    <h3>{approvedCount}</h3>
                                    <span>Verified recipients</span>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon rejected-icon">
                                        ✕
                                    </div>
                                    <p>Rejected</p>
                                    <h3>{rejectedCount}</h3>
                                    <span>Rejected applications</span>
                                </div>

                            </div>

                        </section>

                        {/* Quick Actions */}
                        <section className="admin-quick-section">

                            <div className="admin-section-heading">
                                <div>
                                    <h2>Quick Actions</h2>
                                    <p>Manage recipient verification</p>
                                </div>
                            </div>

                            <div className="admin-quick-card">

                                <div>
                                    <h3>Review Recipient Applications</h3>
                                    <p>
                                        Check submitted details and update
                                        verification status.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigateTo("applications")}
                                >
                                    View Applications →
                                </button>

                            </div>

                            <div className="admin-quick-card">

                                <div>
                                    <h3>Applications Needing More Information</h3>
                                    <p>
                                        Applications waiting for additional
                                        recipient information.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setFilterStatus("Needs More Information");
                                        setActiveSection("applications");
                                    }}
                                >
                                    View {moreInfoCount} Applications →
                                </button>

                            </div>

                        </section>

                    </>

                )}

                {/* Applications Section */}
                {activeSection === "applications" && (

                    <section className="applications-section">

                        <div className="admin-section-heading">
                            <div>
                                <h2>Recipient Verification</h2>
                                <p>
                                    Review and manage recipient applications.
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="application-filters">

                            {filters.map((status) => (

                                <button
                                    key={status}
                                    className={
                                        filterStatus === status
                                            ? "active-filter"
                                            : ""
                                    }
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status}
                                    {status === "Pending" && pendingCount > 0 && (
                                        <span className="filter-count">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>

                            ))}

                        </div>

                        {/* Application List */}
                        {loading && applications.length === 0 ? (

                            <div className="admin-empty-state">
                                Loading applications...
                            </div>

                        ) : filteredApplications.length === 0 ? (

                            <div className="admin-empty-state">
                                <span>▤</span>
                                <h3>No Applications Found</h3>
                                <p>
                                    There are no applications under this filter.
                                </p>
                            </div>

                        ) : (

                            <div className="application-list">

                                {filteredApplications.map((application) => (

                                    <article
                                        className="application-card"
                                        key={application._id}
                                    >

                                        <div className="application-card-top">

                                            <div className="application-user">

                                                <div className="application-avatar">
                                                    {application.fullName?.charAt(0).toUpperCase() || "R"}
                                                </div>

                                                <div>
                                                    <h3>{application.fullName}</h3>
                                                    <p>
                                                        {application.recipient?.email || "Email unavailable"}
                                                    </p>
                                                </div>

                                            </div>

                                            <span
                                                className={`application-status ${application.status
                                                    .toLowerCase()
                                                    .replaceAll(" ", "-")}`}
                                            >
                                                {application.status}
                                            </span>

                                        </div>

                                        <div className="application-details">

                                            <div>
                                                <span>Phone Number</span>
                                                <p>{application.phone || "N/A"}</p>
                                            </div>

                                            <div>
                                                <span>Area</span>
                                                <p>{application.area || "N/A"}</p>
                                            </div>

                                            <div>
                                                <span>People in Household</span>
                                                <p>{application.peopleCount || "N/A"}</p>
                                            </div>

                                            <div>
                                                <span>Referral</span>
                                                <p>{application.referral || "Not provided"}</p>
                                            </div>

                                            <div className="application-reason">
                                                <span>Reason for Request</span>
                                                <p>{application.reason || "N/A"}</p>
                                            </div>

                                            {application.adminNote && (
                                                <div className="application-reason">
                                                    <span>Previous Admin Note</span>
                                                    <p>{application.adminNote}</p>
                                                </div>
                                            )}

                                        </div>

                                        {/* Admin Actions */}
                                        {application.status === "Pending" && (

                                            <div className="application-actions">

                                                <button
                                                    className="approve-btn"
                                                    disabled={processingId === application._id}
                                                    onClick={() =>
                                                        updateApplication(
                                                            application._id,
                                                            "approve"
                                                        )
                                                    }
                                                >
                                                    ✓ Approve
                                                </button>

                                                <button
                                                    className="reject-btn"
                                                    disabled={processingId === application._id}
                                                    onClick={() =>
                                                        updateApplication(
                                                            application._id,
                                                            "reject"
                                                        )
                                                    }
                                                >
                                                    ✕ Reject
                                                </button>

                                                <button
                                                    className="request-info-btn"
                                                    disabled={processingId === application._id}
                                                    onClick={() =>
                                                        updateApplication(
                                                            application._id,
                                                            "request-info"
                                                        )
                                                    }
                                                >
                                                    Request More Info
                                                </button>

                                            </div>

                                        )}

                                        {processingId === application._id && (
                                            <p className="admin-processing">
                                                Updating application...
                                            </p>
                                        )}

                                    </article>

                                ))}

                            </div>

                        )}

                    </section>

                )}

                <footer className="admin-footer">
                    <p>© 2026 SaveBite. Together towards a zero-food-waste future.</p>
                </footer>

            </main>

        </div>
    );
}

export default AdminDashboard;
