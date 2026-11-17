
import { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api";

function AdminDashboard() {
    const [token] = useState(() => localStorage.getItem("token") || "");
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (!token || !user || user.role !== "Admin") {
            window.location.replace("/login");
            return;
        }

        loadApplications();
    }, []);

    const loadApplications = async () => {
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
                throw new Error(data.message || "Could not load applications.");
            }

            setApplications(data.applications || []);
            setMessage("");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
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
            await loadApplications();

        } catch (error) {
            setMessage(error.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const filteredApplications =
        filterStatus === "All"
            ? applications
            : applications.filter(
                (application) => application.status === filterStatus
            );

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
                        <button onClick={loadApplications} disabled={loading}>
                            {loading ? "Loading..." : "Refresh"}
                        </button>
                    </div>

                    {message && <p className="admin-message">{message}</p>}

                    {loading && applications.length === 0 ? (
                        <p>Loading applications...</p>
                    ) : filteredApplications.length === 0 ? (
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
