
import { useState, useEffect } from "react";
import "./DonorDashboard.css";

const API_URL = "http://localhost:5000/api";

function DonorDashboard() {

    // Get login details from the common Login page
    const [token, setToken] = useState(
        () => localStorage.getItem("token") || ""
    );

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    // Add Food form states
    const [foodName, setFoodName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Meals");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("Meals");
    const [pickupAddress, setPickupAddress] = useState("");
    const [expiryTime, setExpiryTime] = useState("");
    const [image, setImage] = useState(null);

    const [message, setMessage] = useState("");

    // Incoming food requests
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestActionMessage, setRequestActionMessage] = useState("");
    const [processingRequestId, setProcessingRequestId] = useState("");

    // Fetch donor requests
    const fetchRequests = async (authToken) => {
        setRequestsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/food-requests/donor`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setRequests(data.requests || []);
            } else {
                setRequestActionMessage(
                    data.message || "Unable to load requests."
                );
            }
        } catch (error) {
            setRequestActionMessage("Unable to connect to the server.");
        } finally {
            setRequestsLoading(false);
        }
    };

    // Check login and load requests
    useEffect(() => {
        if (!token || !user || user.role !== "Donor") {
            window.location.replace("/login");
            return;
        }

        fetchRequests(token);
    }, [token, user]);

    // Add Food
    const handleAddFood = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const formData = new FormData();

            formData.append("foodName", foodName);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("quantity", quantity);
            formData.append("unit", unit);
            formData.append("pickupAddress", pickupAddress);
            formData.append("expiryTime", expiryTime);

            if (image) {
                formData.append("image", image);
            }

            const response = await fetch(`${API_URL}/foods`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Unable to add food.");
                return;
            }

            setMessage("Food listed successfully!");

            setFoodName("");
            setDescription("");
            setCategory("Meals");
            setQuantity("");
            setUnit("Meals");
            setPickupAddress("");
            setExpiryTime("");
            setImage(null);

            e.target.reset();

        } catch (error) {
            setMessage("Unable to connect to the server.");
        }
    };

    // Approve or Reject a request
    const handleRequestAction = async (requestId, action) => {
        setProcessingRequestId(requestId);
        setRequestActionMessage("");

        try {
            const response = await fetch(
                `${API_URL}/food-requests/${requestId}/${action}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setRequestActionMessage(
                    data.message || "Unable to update request."
                );
                return;
            }

            setRequestActionMessage(
                action === "approve"
                    ? "Request approved successfully!"
                    : "Request rejected successfully!"
            );

            await fetchRequests(token);

        } catch (error) {
            setRequestActionMessage("Unable to connect to the server.");
        } finally {
            setProcessingRequestId("");
        }
    };

    // Mark approved request as collected
    const handleMarkCollected = async (requestId) => {
        setProcessingRequestId(requestId);
        setRequestActionMessage("");

        try {
            const response = await fetch(
                `${API_URL}/food-requests/${requestId}/collect`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setRequestActionMessage(
                    data.message || "Unable to mark as collected."
                );
                return;
            }

            setRequestActionMessage("Food marked as collected!");

            await fetchRequests(token);

        } catch (error) {
            setRequestActionMessage("Unable to connect to the server.");
        } finally {
            setProcessingRequestId("");
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken("");
        setUser(null);

        window.location.href = "/login";
    };

    // Wait for redirect if not logged in as Donor
    if (!token || !user || user.role !== "Donor") {
        return null;
    }

    // Request statistics
    const pendingRequests = requests.filter(
        (request) => request.status === "Pending"
    ).length;

    const approvedRequests = requests.filter(
        (request) => request.status === "Approved"
    ).length;

    const collectedRequests = requests.filter(
        (request) => request.status === "Collected"
    ).length;

    // Donor Dashboard
    return (
        <div className="donor-dashboard">

            <header>
                <h1>SaveBite Donor Dashboard</h1>
                <p>Welcome, {user.fullName}!</p>
                <button onClick={handleLogout}>Logout</button>
            </header>

            {/* Request Statistics */}
            <section className="donor-request-stats">

                <div className="donor-request-stat-card">
                    <h3>{requests.length}</h3>
                    <p>Total Requests</p>
                </div>

                <div className="donor-request-stat-card">
                    <h3>{pendingRequests}</h3>
                    <p>Pending Requests</p>
                </div>

                <div className="donor-request-stat-card">
                    <h3>{approvedRequests}</h3>
                    <p>Approved Requests</p>
                </div>

                <div className="donor-request-stat-card">
                    <h3>{collectedRequests}</h3>
                    <p>Collected Requests</p>
                </div>

            </section>

            {/* Incoming Requests */}
            <section className="donor-requests-section">

                <h2>Incoming Food Requests</h2>
                <p>Manage requests submitted by recipients.</p>

                {requestsLoading ? (
                    <p>Loading requests...</p>
                ) : requests.length === 0 ? (
                    <p>No food requests received yet.</p>
                ) : (
                    <div className="donor-requests-grid">

                        {requests.map((request) => (
                            <div
                                className="donor-request-card"
                                key={request._id}
                            >

                                <h3>
                                    {request.food?.foodName || "Food Listing"}
                                </h3>

                                <p>
                                    <strong>Recipient:</strong>{" "}
                                    {request.recipient?.fullName || "Unavailable"}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {request.recipient?.email || "Unavailable"}
                                </p>

                                <p>
                                    <strong>Quantity Requested:</strong>{" "}
                                    {request.quantityRequested}{" "}
                                    {request.food?.unit || ""}
                                </p>

                                <p>
                                    <strong>Message:</strong>{" "}
                                    {request.message || "No message"}
                                </p>

                                <p>
                                    <strong>Pickup Address:</strong>{" "}
                                    {request.food?.pickupAddress || "Unavailable"}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span className={`request-status ${request.status.toLowerCase()}`}>
                                        {request.status}
                                    </span>
                                </p>

                                {request.status === "Pending" && (
                                    <div className="donor-request-actions">

                                        <button
                                            onClick={() =>
                                                handleRequestAction(
                                                    request._id,
                                                    "approve"
                                                )
                                            }
                                            disabled={processingRequestId === request._id}
                                        >
                                            Approve
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleRequestAction(
                                                    request._id,
                                                    "reject"
                                                )
                                            }
                                            disabled={processingRequestId === request._id}
                                        >
                                            Reject
                                        </button>

                                    </div>
                                )}

                                {request.status === "Approved" && (
                                    <button
                                        className="collected-button"
                                        onClick={() =>
                                            handleMarkCollected(request._id)
                                        }
                                        disabled={processingRequestId === request._id}
                                    >
                                        Mark as Collected
                                    </button>
                                )}

                            </div>
                        ))}

                    </div>
                )}

                {requestActionMessage && (
                    <p>{requestActionMessage}</p>
                )}

                <button
                    className="refresh-requests-button"
                    onClick={() => fetchRequests(token)}
                    disabled={requestsLoading}
                >
                    Refresh Requests
                </button>

            </section>

            {/* Add Food */}
            <div className="donor-food-form">

                <h2>Donate Surplus Food</h2>
                <p>Share your extra food with people who need it.</p>

                <form onSubmit={handleAddFood}>

                    <label>Food Name</label>
                    <input
                        type="text"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="Example: Vegetable Rice"
                        required
                    />

                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the food"
                        required
                    />

                    <label>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Meals">Meals</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Other">Other</option>
                    </select>

                    <label>Quantity</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />

                    <label>Unit</label>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    >
                        <option value="Meals">Meals</option>
                        <option value="Packets">Packets</option>
                        <option value="Kg">Kg</option>
                        <option value="Litres">Litres</option>
                        <option value="Pieces">Pieces</option>
                    </select>

                    <label>Pickup Address</label>
                    <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Enter pickup address"
                        required
                    />

                    <label>Expiry Date and Time</label>
                    <input
                        type="datetime-local"
                        value={expiryTime}
                        onChange={(e) => setExpiryTime(e.target.value)}
                        required
                    />

                    <label>Upload Food Image</label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                            setImage(e.target.files[0] || null)
                        }
                    />

                    <button type="submit">List Food</button>

                </form>

                {message && <p>{message}</p>}

            </div>

        </div>
    );
}

export default DonorDashboard;
