
import { useState, useEffect } from "react";
import "./RecipientDashboard.css";

const API_URL = "http://localhost:5000/api";
const IMAGE_URL = "http://localhost:5000";

function RecipientDashboard() {

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

    const [verificationStatus, setVerificationStatus] = useState("Loading...");
    const [adminNote, setAdminNote] = useState("");

    const [foods, setFoods] = useState([]);
    const [foodLoading, setFoodLoading] = useState(true);

    // Food request states
    const [myRequests, setMyRequests] = useState([]);
    const [requestQuantities, setRequestQuantities] = useState({});
    const [requestMessages, setRequestMessages] = useState({});
    const [requestActionMessage, setRequestActionMessage] = useState("");
    const [requestingFoodId, setRequestingFoodId] = useState("");

    // Check login and user role
    useEffect(() => {
        if (!token || !user || user.role !== "Recipient") {
            window.location.replace("/login");
        }
    }, [token, user]);

    // Fetch recipient verification status
    useEffect(() => {
        if (!token || !user || user.role !== "Recipient") return;

        const fetchVerificationStatus = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/recipient-verification/my-status`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.status === 404) {
                    setVerificationStatus("Not Submitted");
                    setAdminNote("");
                    return;
                }

                if (!response.ok) {
                    setVerificationStatus("Unable to load status");
                    return;
                }

                setVerificationStatus(data.application.status);
                setAdminNote(data.application.adminNote || "");

            } catch (error) {
                setVerificationStatus("Unable to load status");
            }
        };

        fetchVerificationStatus();

    }, [token, user]);

    // Fetch available food
    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const response = await fetch(`${API_URL}/foods`);
                const data = await response.json();

                if (response.ok) {
                    setFoods(data.foods || []);
                }
            } catch (error) {
                console.error("Error fetching food:", error);
            } finally {
                setFoodLoading(false);
            }
        };

        fetchFoods();
    }, []);

    // Fetch recipient's food requests
    useEffect(() => {
        if (!token || !user || user.role !== "Recipient") return;

        const fetchMyRequests = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/food-requests/my-requests`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setMyRequests(data.requests || []);
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        fetchMyRequests();

    }, [token, user]);

    // Request food
    const handleRequestFood = async (foodId) => {

        if (verificationStatus !== "Approved") {
            setRequestActionMessage(
                "Your account must be approved before requesting food."
            );
            return;
        }

        const quantity = Number(requestQuantities[foodId] || 1);

        const selectedFood = foods.find(
            (food) => food._id === foodId
        );

        if (
            !selectedFood ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > selectedFood.quantity
        ) {
            setRequestActionMessage("Please enter a valid quantity.");
            return;
        }

        setRequestingFoodId(foodId);
        setRequestActionMessage("");

        try {
            const response = await fetch(`${API_URL}/food-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    foodId: foodId,
                    quantityRequested: quantity,
                    message: requestMessages[foodId] || ""
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setRequestActionMessage(
                    data.message || "Unable to submit your request."
                );
                return;
            }

            setRequestActionMessage(
                "Food request submitted successfully!"
            );

            // Refresh My Requests
            const requestsResponse = await fetch(
                `${API_URL}/food-requests/my-requests`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const requestsData = await requestsResponse.json();

            if (requestsResponse.ok) {
                setMyRequests(requestsData.requests || []);
            }

            // Clear selected form fields
            setRequestQuantities((previous) => ({
                ...previous,
                [foodId]: 1
            }));

            setRequestMessages((previous) => ({
                ...previous,
                [foodId]: ""
            }));

        } catch (error) {
            setRequestActionMessage(
                "Unable to connect to the server."
            );
        } finally {
            setRequestingFoodId("");
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

    // Wait for redirect if not logged in as Recipient
    if (!token || !user || user.role !== "Recipient") {
        return null;
    }

    // Dashboard statistics
    const collectedMeals = myRequests
        .filter((request) => request.status === "Collected")
        .reduce(
            (total, request) => total + request.quantityRequested,
            0
        );

    // Recipient Dashboard
    return (
        <div className="recipient-dashboard">

            <header className="recipient-header">
                <h2>Save<span>Bite</span></h2>

                <div>
                    <span>Welcome, {user.fullName}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* Welcome Section */}
            <section className="recipient-welcome">
                <p>WELCOME TO SAVEBITE</p>
                <h1>Your Food Journey Starts Here!</h1>
                <p>
                    Discover available surplus food and make every meal count.
                </p>
            </section>

            {/* Verification Status */}
            <section className="verification-card">

                <h2>Account Verification</h2>
                <p>Your current verification status:</p>

                <span
                    className={`verification-badge ${verificationStatus
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                >
                    {verificationStatus}
                </span>

                {adminNote && (
                    <div className="admin-feedback">
                        <h3>Admin Feedback</h3>
                        <p>{adminNote}</p>
                    </div>
                )}

                {verificationStatus === "Not Submitted" && (
                    <p>Please submit your verification application.</p>
                )}

                {verificationStatus === "Pending" && (
                    <p>Your application is waiting for Admin review.</p>
                )}

                {verificationStatus === "Approved" && (
                    <p>
                        Your account is verified! You can request available food.
                    </p>
                )}

                {verificationStatus === "Rejected" && (
                    <p>
                        Your application was rejected. Please check the Admin feedback.
                    </p>
                )}

                {verificationStatus === "Needs More Information" && (
                    <p>
                        Additional information is required. Please check the Admin feedback.
                    </p>
                )}

            </section>

            {/* Statistics */}
            <section className="recipient-stats">

                <div className="recipient-stat-card">
                    <h3>{foods.length}</h3>
                    <p>Available Food Items</p>
                </div>

                <div className="recipient-stat-card">
                    <h3>{myRequests.length}</h3>
                    <p>My Requests</p>
                </div>

                <div className="recipient-stat-card">
                    <h3>{collectedMeals}</h3>
                    <p>Collected Meals</p>
                </div>

            </section>

            {/* Available Food */}
            <section className="recipient-food-section">

                <h2>Available Food</h2>
                <p>Explore surplus food shared by our donors.</p>

                {foodLoading ? (
                    <p>Loading available food...</p>
                ) : foods.length === 0 ? (
                    <div className="empty-food-message">
                        No food listings are currently available.
                    </div>
                ) : (
                    <div className="recipient-food-grid">

                        {foods.map((food) => (
                            <div
                                className="recipient-food-card"
                                key={food._id}
                            >

                                <span className="food-available-badge">
                                    {food.status}
                                </span>

                                {/* Food Image */}
                                {food.image ? (
                                    <img
                                        className="recipient-food-image"
                                        src={`${IMAGE_URL}${food.image}`}
                                        alt={food.foodName}
                                    />
                                ) : (
                                    <div className="food-image-placeholder">
                                        No Image Available
                                    </div>
                                )}

                                <div className="recipient-food-info">

                                    <h3>{food.foodName}</h3>
                                    <p>{food.description}</p>

                                    <p>
                                        <strong>Category:</strong>{" "}
                                        {food.category}
                                    </p>

                                    <p>
                                        <strong>Quantity:</strong>{" "}
                                        {food.quantity} {food.unit}
                                    </p>

                                    <p>
                                        <strong>Pickup Address:</strong>{" "}
                                        {food.pickupAddress}
                                    </p>

                                    <p>
                                        <strong>Expiry:</strong>{" "}
                                        {new Date(food.expiryTime).toLocaleString()}
                                    </p>

                                    {/* Request Food */}
                                    {verificationStatus === "Approved" ? (

                                        <div className="food-request-form">

                                            <label>Quantity to request:</label>

                                            <input
                                                type="number"
                                                min="1"
                                                max={food.quantity}
                                                value={requestQuantities[food._id] ?? 1}
                                                onChange={(e) =>
                                                    setRequestQuantities((previous) => ({
                                                        ...previous,
                                                        [food._id]: e.target.value
                                                    }))
                                                }
                                            />

                                            <label>
                                                Message to donor (optional):
                                            </label>

                                            <textarea
                                                maxLength="300"
                                                placeholder="Write a message..."
                                                value={requestMessages[food._id] || ""}
                                                onChange={(e) =>
                                                    setRequestMessages((previous) => ({
                                                        ...previous,
                                                        [food._id]: e.target.value
                                                    }))
                                                }
                                            />

                                            <button
                                                onClick={() =>
                                                    handleRequestFood(food._id)
                                                }
                                                disabled={
                                                    requestingFoodId === food._id
                                                }
                                            >
                                                {requestingFoodId === food._id
                                                    ? "Submitting..."
                                                    : "Request Food"}
                                            </button>

                                        </div>

                                    ) : (
                                        <p>
                                            Account approval is required to request food.
                                        </p>
                                    )}

                                </div>
                            </div>
                        ))}

                    </div>
                )}

                {requestActionMessage && (
                    <p>{requestActionMessage}</p>
                )}

            </section>

            {/* My Requests */}
            <section className="recipient-food-section">

                <h2>My Requests</h2>
                <p>Track the food requests you have submitted.</p>

                {myRequests.length === 0 ? (
                    <p>
                        You haven't submitted any food requests yet.
                    </p>
                ) : (
                    <div className="recipient-food-grid">

                        {myRequests.map((request) => (
                            <div
                                className="recipient-food-card"
                                key={request._id}
                            >

                                <div className="recipient-food-info">

                                    <h3>
                                        {request.food?.foodName || "Food Listing"}
                                    </h3>

                                    <p>
                                        <strong>Quantity Requested:</strong>{" "}
                                        {request.quantityRequested}
                                    </p>

                                    <p>
                                        <strong>Donor:</strong>{" "}
                                        {request.donor?.fullName || "Unavailable"}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {request.status}
                                    </p>

                                    {request.message && (
                                        <p>
                                            <strong>Your Message:</strong>{" "}
                                            {request.message}
                                        </p>
                                    )}

                                    <p>
                                        <strong>Requested On:</strong>{" "}
                                        {new Date(request.createdAt).toLocaleString()}
                                    </p>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default RecipientDashboard;
