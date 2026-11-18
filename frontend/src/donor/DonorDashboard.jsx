
import { useState, useEffect } from "react";
import "./DonorDashboard.css";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

function DonorDashboard() {
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

    // Requests
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestActionMessage, setRequestActionMessage] = useState("");
    const [processingRequestId, setProcessingRequestId] = useState("");

    // Donor food listings
    const [myFoods, setMyFoods] = useState([]);
    const [foodsLoading, setFoodsLoading] = useState(false);
    const [foodsMessage, setFoodsMessage] = useState("");
    const [deletingFoodId, setDeletingFoodId] = useState("");

    // Fetch incoming requests
    const fetchRequests = async (authToken) => {
        setRequestsLoading(true);

        try {
            const response = await fetch(`${API_URL}/food-requests/donor`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setRequests(data.requests || []);
            } else {
                setRequestActionMessage(
                    data.message || "Unable to load requests."
                );
            }
        } catch {
            setRequestActionMessage("Unable to connect to the server.");
        } finally {
            setRequestsLoading(false);
        }
    };

    // Fetch donor food listings
    const fetchMyFoods = async (authToken) => {
        setFoodsLoading(true);
        setFoodsMessage("");

        try {
            const response = await fetch(`${API_URL}/foods/my-listings`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load food listings."
                );
            }

            setMyFoods(data.foods || []);
        } catch (error) {
            setFoodsMessage(
                error.message || "Unable to connect to the server."
            );
        } finally {
            setFoodsLoading(false);
        }
    };

    // Check login and load dashboard data
    useEffect(() => {
        if (!token || !user || user.role !== "Donor") {
            window.location.replace("/login");
            return;
        }

        fetchRequests(token);
        fetchMyFoods(token);
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

            await fetchMyFoods(token);

        } catch {
            setMessage("Unable to connect to the server.");
        }
    };
    // Delete food listing
const handleDeleteFood = async (foodId, foodName) => {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${foodName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingFoodId(foodId);
    setFoodsMessage("");

    try {
        const response = await fetch(`${API_URL}/foods/${foodId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete food listing.");
        }

        setFoodsMessage(data.message || "Food listing deleted successfully!");

        await fetchMyFoods(token);
        await fetchRequests(token);

    } catch (error) {
        setFoodsMessage(error.message || "Unable to connect to the server.");
    } finally {
        setDeletingFoodId("");
    }
};

    // Approve or reject request
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
            await fetchMyFoods(token);

        } catch {
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

        } catch {
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

    // Redirect if not a donor
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

    const availableFoods = myFoods.filter(
        (food) => food.status === "Available"
    ).length;

    const formatDate = (date) => {
        if (!date) return "Unavailable";

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    return (
        <div className="donor-dashboard">

            {/* NAVIGATION */}
            <nav className="donor-navbar">
                <a href="/" className="donor-brand">
                    🥬 Save<span>Bite</span>
                </a>

                <div className="donor-nav-links">
                    <a href="#donor-overview">Overview</a>
                    <a href="#donor-requests">Requests</a>
                    <a href="#donor-listings">My Listings</a>
                    <a href="#donor-add-food">Donate Food</a>
                </div>

                <button
                    className="donor-logout-btn"
                    onClick={handleLogout}
                >
                    Logout ↗
                </button>
            </nav>

            <main className="donor-main">

                {/* WELCOME SECTION */}
                <section className="donor-welcome" id="donor-overview">
                    <div>
                        <span className="donor-welcome-tag">
                            🌱 DONOR DASHBOARD
                        </span>

                        <h1>
                            Hello, {user.fullName}!
                        </h1>

                        <p>
                            Your generosity makes a difference.
                            Manage your food donations and help reduce food waste.
                        </p>
                    </div>

                    <div className="donor-welcome-icon">
                        🥗
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="donor-stats-grid">

                    <div className="donor-stat-card">
                        <div className="donor-stat-icon purple">📩</div>
                        <div>
                            <h2>{requests.length}</h2>
                            <p>Total Requests</p>
                        </div>
                    </div>

                    <div className="donor-stat-card">
                        <div className="donor-stat-icon orange">⏳</div>
                        <div>
                            <h2>{pendingRequests}</h2>
                            <p>Pending Requests</p>
                        </div>
                    </div>

                    <div className="donor-stat-card">
                        <div className="donor-stat-icon blue">🤝</div>
                        <div>
                            <h2>{approvedRequests}</h2>
                            <p>Approved Requests</p>
                        </div>
                    </div>

                    <div className="donor-stat-card">
                        <div className="donor-stat-icon green">✅</div>
                        <div>
                            <h2>{collectedRequests}</h2>
                            <p>Collected Requests</p>
                        </div>
                    </div>

                    <div className="donor-stat-card">
                        <div className="donor-stat-icon yellow">🥬</div>
                        <div>
                            <h2>{myFoods.length}</h2>
                            <p>Total Food Listings</p>
                        </div>
                    </div>

                    <div className="donor-stat-card">
                        <div className="donor-stat-icon green">🌿</div>
                        <div>
                            <h2>{availableFoods}</h2>
                            <p>Available Listings</p>
                        </div>
                    </div>

                </section>

                {/* INCOMING REQUESTS */}
                <section
                    className="donor-section"
                    id="donor-requests"
                >
                    <div className="donor-section-heading">
                        <div>
                            <span className="donor-section-tag">
                                REQUEST MANAGEMENT
                            </span>
                            <h2>Incoming Food Requests</h2>
                            <p>
                                Review and manage requests from recipients.
                            </p>
                        </div>

                        <button
                            className="donor-refresh-btn"
                            onClick={() => fetchRequests(token)}
                            disabled={requestsLoading}
                        >
                            {requestsLoading ? "Refreshing..." : "↻ Refresh"}
                        </button>
                    </div>

                    {requestActionMessage && (
                        <div className="donor-feedback">
                            {requestActionMessage}
                        </div>
                    )}

                    {requestsLoading ? (
                        <div className="donor-empty-state">
                            <span>⏳</span>
                            <p>Loading incoming requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="donor-empty-state">
                            <span>📭</span>
                            <h3>No requests yet</h3>
                            <p>
                                Recipient requests will appear here when someone
                                requests your food.
                            </p>
                        </div>
                    ) : (
                        <div className="donor-card-grid">
                            {requests.map((request) => (
                                <article
                                    className="donor-request-card"
                                    key={request._id}
                                >
                                    <div className="donor-card-top">
                                        <span className="donor-card-icon">
                                            🍱
                                        </span>

                                        <span
                                            className={`donor-status ${(
                                                request.status || ""
                                            ).toLowerCase()}`}
                                        >
                                            {request.status}
                                        </span>
                                    </div>

                                    <h3>
                                        {request.food?.foodName || "Food Listing"}
                                    </h3>

                                    <div className="donor-card-details">
                                        <p>
                                            <strong>Recipient</strong>
                                            <span>
                                                {request.recipient?.fullName || "Unavailable"}
                                            </span>
                                        </p>

                                        <p>
                                            <strong>Email</strong>
                                            <span>
                                                {request.recipient?.email || "Unavailable"}
                                            </span>
                                        </p>

                                        <p>
                                            <strong>Quantity requested</strong>
                                            <span>
                                                {request.quantityRequested}{" "}
                                                {request.food?.unit || ""}
                                            </span>
                                        </p>

                                        <p>
                                            <strong>Pickup address</strong>
                                            <span>
                                                {request.food?.pickupAddress || "Unavailable"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="donor-request-message">
                                        <strong>Recipient's message</strong>
                                        <p>
                                            {request.message || "No message provided."}
                                        </p>
                                    </div>

                                    {request.status === "Pending" && (
                                        <div className="donor-request-actions">
                                            <button
                                                className="donor-approve-btn"
                                                onClick={() =>
                                                    handleRequestAction(
                                                        request._id,
                                                        "approve"
                                                    )
                                                }
                                                disabled={
                                                    processingRequestId === request._id
                                                }
                                            >
                                                {processingRequestId === request._id
                                                    ? "Processing..."
                                                    : "✓ Approve"}
                                            </button>

                                            <button
                                                className="donor-reject-btn"
                                                onClick={() =>
                                                    handleRequestAction(
                                                        request._id,
                                                        "reject"
                                                    )
                                                }
                                                disabled={
                                                    processingRequestId === request._id
                                                }
                                            >
                                                {processingRequestId === request._id
                                                    ? "Processing..."
                                                    : "✕ Reject"}
                                            </button>
                                        </div>
                                    )}

                                    {request.status === "Approved" && (
                                        <button
                                            className="donor-collected-btn"
                                            onClick={() =>
                                                handleMarkCollected(request._id)
                                            }
                                            disabled={
                                                processingRequestId === request._id
                                            }
                                        >
                                            {processingRequestId === request._id
                                                ? "Processing..."
                                                : "✓ Mark as Collected"}
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* MY FOOD LISTINGS */}
                <section
                    className="donor-section"
                    id="donor-listings"
                >
                    <div className="donor-section-heading">
                        <div>
                            <span className="donor-section-tag">
                                YOUR CONTRIBUTION
                            </span>
                            <h2>My Food Listings</h2>
                            <p>
                                Keep track of the food you have shared.
                            </p>
                        </div>

                        <button
                            className="donor-refresh-btn"
                            onClick={() => fetchMyFoods(token)}
                            disabled={foodsLoading}
                        >
                            {foodsLoading ? "Refreshing..." : "↻ Refresh"}
                        </button>
                    </div>

                    {foodsMessage && (
                        <div className="donor-feedback error">
                            {foodsMessage}
                        </div>
                    )}

                    {foodsLoading ? (
                        <div className="donor-empty-state">
                            <span>⏳</span>
                            <p>Loading your food listings...</p>
                        </div>
                    ) : myFoods.length === 0 ? (
                        <div className="donor-empty-state">
                            <span>🥗</span>
                            <h3>No food listings yet</h3>
                            <p>
                                Start sharing surplus food with your community.
                            </p>
                            <a href="#donor-add-food">
                                Add Your First Listing →
                            </a>
                        </div>
                    ) : (
                        <div className="donor-card-grid">
                            {myFoods.map((food) => (
                                <article
                                    className="donor-food-card"
                                    key={food._id}
                                >
                                    {food.image ? (
                                        <img
                                            className="donor-food-image"
                                            src={`${SERVER_URL}${food.image}`}
                                            alt={food.foodName}
                                        />
                                    ) : (
                                        <div className="donor-food-placeholder">
                                            🥗
                                        </div>
                                    )}

                                    <div className="donor-food-content">
                                        <div className="donor-food-top">
                                            <span className="donor-category">
                                                {food.category}
                                            </span>

                                            <span
                                                className={`donor-status ${(
                                                    food.status || ""
                                                ).toLowerCase()}`}
                                            >
                                                {food.status}
                                            </span>
                                        </div>

                                        <h3>{food.foodName}</h3>

                                        <p className="donor-food-description">
                                            {food.description}
                                        </p>

                                        <div className="donor-card-details">
                                            <p>
                                                <strong>Quantity remaining</strong>
                                                <span>
                                                    {food.quantity} {food.unit}
                                                </span>
                                            </p>

                                            <p>
                                                <strong>Pickup location</strong>
                                                <span>{food.pickupAddress}</span>
                                            </p>

                                            <p>
                                                <strong>Expiry</strong>
                                                <span>{formatDate(food.expiryTime)}</span>
                                            </p>
                                        </div>

                                        {new Date(food.expiryTime) <= new Date() && (
                                            <span className="donor-expired-label">
                                                Expired
                                            </span>
                                        )}
                                        <button
    className="donor-delete-btn"
    onClick={() => handleDeleteFood(food._id, food.foodName)}
    disabled={deletingFoodId === food._id}
>
    {deletingFoodId === food._id
        ? "Deleting..."
        : "🗑 Delete Listing"}
</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ADD FOOD FORM */}
                <section
                    className="donor-add-section"
                    id="donor-add-food"
                >
                    <div className="donor-add-intro">
                        <span className="donor-section-tag">
                            MAKE A DIFFERENCE
                        </span>

                        <h2>Share Food, Spread Happiness 💚</h2>

                        <p>
                            Have surplus food? List it on SaveBite and help
                            someone in your community.
                        </p>
                    </div>

                    <div className="donor-food-form-card">
                        <h3>🥗 Add a New Food Listing</h3>

                        <p className="donor-form-subtitle">
                            Enter the details below to share your food.
                        </p>

                        <form onSubmit={handleAddFood}>

                            <div className="donor-form-grid">

                                <div className="donor-form-field">
                                    <label>Food Name</label>
                                    <input
                                        type="text"
                                        value={foodName}
                                        onChange={(e) => setFoodName(e.target.value)}
                                        placeholder="Example: Vegetable Rice"
                                        required
                                    />
                                </div>

                                <div className="donor-form-field">
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
                                </div>

                                <div className="donor-form-field">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Enter quantity"
                                        required
                                    />
                                </div>

                                <div className="donor-form-field">
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
                                </div>

                                <div className="donor-form-field donor-full-width">
                                    <label>Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the food you are donating..."
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="donor-form-field donor-full-width">
                                    <label>Pickup Address</label>
                                    <input
                                        type="text"
                                        value={pickupAddress}
                                        onChange={(e) => setPickupAddress(e.target.value)}
                                        placeholder="Enter the complete pickup address"
                                        required
                                    />
                                </div>

                                <div className="donor-form-field">
                                    <label>Expiry Date and Time</label>
                                    <input
                                        type="datetime-local"
                                        value={expiryTime}
                                        onChange={(e) => setExpiryTime(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="donor-form-field">
                                    <label>Upload Food Image</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) =>
                                            setImage(e.target.files[0] || null)
                                        }
                                    />
                                    <small>JPG, PNG or WEBP (maximum 5 MB)</small>
                                </div>

                            </div>

                            {message && (
                                <div className={`donor-feedback ${
                                    message.includes("successfully")
                                        ? "success"
                                        : "error"
                                }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="donor-submit-btn"
                            >
                                🌱 List Food for Donation
                            </button>

                        </form>
                    </div>
                </section>

            </main>

            {/* FOOTER */}
            <footer className="donor-footer">
                <h3>🥬 SaveBite</h3>
                <p>Share More. Waste Less. Care More.</p>
                <span>© 2026 SaveBite. Making a difference together.</span>
            </footer>

        </div>
    );
}

export default DonorDashboard;
