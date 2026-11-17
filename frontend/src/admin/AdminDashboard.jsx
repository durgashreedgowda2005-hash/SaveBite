
import { useState } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api";

function AdminDashboard() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const filteredApplications =
    filterStatus === "All"
        ? applications
        : applications.filter(
            (application) => application.status === filterStatus
        );

    const loginAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            if (data.user?.role !== "Admin") {
                throw new Error("Access denied. Admin account required.");
            }

            setToken(data.token);
            await loadApplications(data.token);

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadApplications = async (adminToken) => {
        try {
            const response = await fetch(
                `${API_URL}/recipient-verification/admin/applications`,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not load applications.");
            }

            setApplications(data.applications || []);
        } catch (error) {
            setMessage(error.message);
        }
    };

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
            await loadApplications(token);

        } catch (error) {
            setMessage(error.message);
        }
    };

    const logout = () => {
        setToken("");
        setPassword("");
        setApplications([]);
        setMessage("");
    };

    if (!token) {
        return (
            <div className="admin-login-page">
                <form className="admin-login-card" onSubmit={loginAdmin}>
                    <h1>SaveBite Admin</h1>
                    <p>Sign in to manage recipient applications.</p>

                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter admin email"
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        required
                    />

                    {message && <p className="admin-message">{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Admin Login"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1>SaveBite Admin</h1>
                    <p>Recipient Verification Management</p>
                </div>
                <button onClick={logout}>Logout</button>
            </header>

            <main className="admin-content">
                <div className="admin-summary">
                    <div>
                        <h3>{applications.length}</h3>
                        <p>Total Applications</p>
                    </div>
                    <div>
                        <h3>{applications.filter(a => a.status === "Pending").length}</h3>
                        <p>Pending</p>
                    </div>
                    <div>
                        <h3>{applications.filter(a => a.status === "Approved").length}</h3>
                        <p>Approved</p>
                    </div>
                    <div>
                        <h3>{applications.filter(a => a.status === "Rejected").length}</h3>
                        <p>Rejected</p>
                    </div>
                </div>

                <section className="applications-section">
                    <div className="application-filters">
    {[
        "All",
        "Pending",
        "Approved",
        "Rejected",
        "Needs More Information"
    ].map((status) => (
        <button
            key={status}
            className={filterStatus === status ? "active-filter" : ""}
            onClick={() => setFilterStatus(status)}
        >
            {status}
        </button>
    ))}
</div>
                    <div className="applications-heading">
                        <h2>Recipient Applications</h2>
                        <button onClick={() => loadApplications(token)}>
                            Refresh
                        </button>
                    </div>

                    {message && <p className="admin-message">{message}</p>}

                    {filteredApplications.length === 0 ? (
    <p>No applications found for this filter.</p>
) : (
    <div className="application-list">
        {filteredApplications.map((application) => (
                                <article className="application-card" key={application._id}>
                                    <div className="application-details">
                                        <h3>{application.fullName}</h3>
                                        <p>Email: {application.recipient?.email || "N/A"}</p>
                                        <p>Phone: {application.phone}</p>
                                        <p>Area: {application.area}</p>
                                        <p>People: {application.peopleCount}</p>
                                        <p>Reason: {application.reason}</p>
                                        <p>Referral: {application.referral || "Not provided"}</p>
                                        <p>
                                            Status: <strong>{application.status}</strong>
                                        </p>

                                        {application.adminNote && (
                                            <p>Admin Note: {application.adminNote}</p>
                                        )}
                                    </div>

                                    {application.status === "Pending" && (
                                        <div className="application-actions">
                                            <button
                                                onClick={() => updateApplication(application._id, "approve")}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() => updateApplication(application._id, "reject")}
                                            >
                                                Reject
                                            </button>

                                            <button
                                                onClick={() => updateApplication(application._id, "request-info")}
                                            >
                                                Request More Info
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
