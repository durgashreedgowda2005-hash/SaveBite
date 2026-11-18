
import { useState, useEffect } from "react";
import "./RecipientDashboard.css";

const API_URL = "http://localhost:5000/api";
const IMAGE_URL = "http://localhost:5000";

const initialVerificationForm = {
    recipientType: "Individual",
    organizationName: "",
    organizationType: "",
    fullName: "",
    phone: "",
    area: "",
    peopleCount: "",
    reason: "",
    referral: ""
};

function RecipientDashboard() {

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
    const [application, setApplication] = useState(null);

    // Verification form states
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [verificationSubmitting, setVerificationSubmitting] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");

    const [verificationForm, setVerificationForm] = useState(
        initialVerificationForm
    );

    const [foods, setFoods] = useState([]);
    const [foodLoading, setFoodLoading] = useState(true);

    // Food request states
    const [myRequests, setMyRequests] = useState([]);
    const [requestQuantities, setRequestQuantities] = useState({});
    const [requestMessages, setRequestMessages] = useState({});
    const [requestActionMessage, setRequestActionMessage] = useState("");
    const [requestingFoodId, setRequestingFoodId] = useState("");

    // Check login and role
    useEffect(() => {
        if (!token || !user || user.role !== "Recipient") {
            window.location.replace("/login");
        }
    }, [token, user]);

    // Fetch verification status
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
                    setApplication(null);
                    setVerificationForm(initialVerificationForm);
                    return;
                }

                if (!response.ok) {
                    setVerificationStatus("Unable to load status");
                    return;
                }

                const currentApplication = data.application;

                setApplication(currentApplication);
                setVerificationStatus(currentApplication.status);
                setAdminNote(currentApplication.adminNote || "");

                setVerificationForm({
                    recipientType: currentApplication.recipientType || "Individual",
                    organizationName: currentApplication.organizationName || "",
                    organizationType: currentApplication.organizationType || "",
                    fullName: currentApplication.fullName || "",
                    phone: currentApplication.phone || "",
                    area: currentApplication.area || "",
                    peopleCount: currentApplication.peopleCount || "",
                    reason: currentApplication.reason || "",
                    referral: currentApplication.referral || ""
                });

            } catch (error) {
                setVerificationStatus("Unable to load status");
            }
        };

        fetchVerificationStatus();

    }, [token, user]);

    // Handle verification form changes
    const handleVerificationChange = (e) => {
        const { name, value } = e.target;

        setVerificationForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Change recipient type
    const handleRecipientTypeChange = (type) => {
        setVerificationForm((previous) => ({
            ...previous,
            recipientType: type
        }));

        setVerificationMessage("");
    };

    // Open verification form
    const handleOpenVerificationForm = () => {
        setVerificationMessage("");
        setShowVerificationForm(true);
    };

    // Submit or resubmit verification application
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();

        const isOrganization =
            verificationForm.recipientType === "Organization";

        if (
            !verificationForm.fullName.trim() ||
            !verificationForm.phone.trim() ||
            !verificationForm.area.trim() ||
            !verificationForm.peopleCount ||
            !verificationForm.reason.trim()
        ) {
            setVerificationMessage("Please complete all required fields.");
            return;
        }

        if (
            isOrganization &&
            (!verificationForm.organizationName.trim() ||
                !verificationForm.organizationType)
        ) {
            setVerificationMessage(
                "Please provide your organization name and type."
            );
            return;
        }

        if (!/^[0-9+\-\s]{7,15}$/.test(verificationForm.phone.trim())) {
            setVerificationMessage("Please enter a valid phone number.");
            return;
        }

        const peopleCount = Number(verificationForm.peopleCount);

        if (!Number.isInteger(peopleCount) || peopleCount < 1) {
            setVerificationMessage(
                "Number of people must be a positive whole number."
            );
            return;
        }

        if (verificationForm.reason.trim().length > 500) {
            setVerificationMessage("Reason cannot exceed 500 characters.");
            return;
        }

        if (verificationForm.referral.trim().length > 200) {
            setVerificationMessage("Referral cannot exceed 200 characters.");
            return;
        }

        setVerificationSubmitting(true);
        setVerificationMessage("");

        try {
            const isResubmission =
                verificationStatus === "Needs More Information";

            const response = await fetch(
                isResubmission
                    ? `${API_URL}/recipient-verification/my-application`
                    : `${API_URL}/recipient-verification`,
                {
                    method: isResubmission ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...verificationForm,
                        organizationName: isOrganization
                            ? verificationForm.organizationName.trim()
                            : "",
                        organizationType: isOrganization
                            ? verificationForm.organizationType
                            : "",
                        peopleCount
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setVerificationMessage(
                    data.message || "Unable to submit your application."
                );
                return;
            }

            setApplication(data.application);
            setVerificationStatus("Pending");
            setAdminNote("");
            setShowVerificationForm(false);

            setVerificationMessage(
                isResubmission
                    ? "Your updated application has been resubmitted successfully!"
                    : "Your verification application has been submitted successfully!"
            );

        } catch (error) {
            setVerificationMessage("Unable to connect to the server.");
        } finally {
            setVerificationSubmitting(false);
        }
    };

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

    // Fetch recipient food requests
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
                    foodId,
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

            setRequestQuantities((previous) => ({
                ...previous,
                [foodId]: 1
            }));

            setRequestMessages((previous) => ({
                ...previous,
                [foodId]: ""
            }));

        } catch (error) {
            setRequestActionMessage("Unable to connect to the server.");
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

    if (!token || !user || user.role !== "Recipient") {
        return null;
    }

    const collectedMeals = myRequests
        .filter((request) => request.status === "Collected")
        .reduce(
            (total, request) => total + request.quantityRequested,
            0
        );

    const isOrganization =
        verificationForm.recipientType === "Organization";

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
                    <>
                        <p>Please submit your verification application.</p>
                        <button onClick={handleOpenVerificationForm}>
                            Submit Verification Details
                        </button>
                    </>
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
                    <>
                        <p>
                            Additional information is required. Please update your application.
                        </p>
                        <button onClick={handleOpenVerificationForm}>
                            Update Verification Details
                        </button>
                    </>
                )}

                {verificationMessage && (
                    <p className="verification-message">
                        {verificationMessage}
                    </p>
                )}

            </section>

            {/* Recipient Verification Form */}
            {showVerificationForm && (
                <section className="recipient-verification-form">

                    <div className="verification-form-heading">
                        <div className="verification-heading-icon">
                            <span>✓</span>
                        </div>

                        <div>
                            <p className="verification-eyebrow">
                                SAVEBITE COMMUNITY
                            </p>

                            <h2>
                                {verificationStatus === "Needs More Information"
                                    ? "Update Your Application"
                                    : "Recipient Verification"}
                            </h2>

                            <p>
                                Help us understand your food assistance requirements.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleVerificationSubmit}>

                        {/* Recipient Type */}
                        <div className="verification-form-section">
                            <div className="verification-section-title">
                                <span>01</span>
                                <div>
                                    <h3>Who are you requesting food for?</h3>
                                    <p>Select the option that best describes you.</p>
                                </div>
                            </div>

                            <div className="recipient-type-options">

                                <button
                                    type="button"
                                    className={`recipient-type-option ${
                                        !isOrganization ? "selected" : ""
                                    }`}
                                    onClick={() =>
                                        handleRecipientTypeChange("Individual")
                                    }
                                >
                                    <span className="recipient-type-icon">🏠</span>
                                    <span className="recipient-type-text">
                                        <strong>Individual / Family</strong>
                                        <small>Food assistance for a household</small>
                                    </span>
                                    <span className="recipient-type-check">
                                        {!isOrganization ? "✓" : ""}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`recipient-type-option ${
                                        isOrganization ? "selected" : ""
                                    }`}
                                    onClick={() =>
                                        handleRecipientTypeChange("Organization")
                                    }
                                >
                                    <span className="recipient-type-icon">🏢</span>
                                    <span className="recipient-type-text">
                                        <strong>Organization</strong>
                                        <small>Ashrama, NGO, orphanage, etc.</small>
                                    </span>
                                    <span className="recipient-type-check">
                                        {isOrganization ? "✓" : ""}
                                    </span>
                                </button>

                            </div>
                        </div>

                        {/* Organization Details */}
                        {isOrganization && (
                            <div className="verification-form-section">

                                <div className="verification-section-title">
                                    <span>02</span>
                                    <div>
                                        <h3>Organization Information</h3>
                                        <p>Tell us about your organization.</p>
                                    </div>
                                </div>

                                <div className="verification-fields-grid">

                                    <div className="verification-field full-width">
                                        <label>Organization Name *</label>
                                        <input
                                            type="text"
                                            name="organizationName"
                                            value={verificationForm.organizationName}
                                            onChange={handleVerificationChange}
                                            placeholder="Enter your organization name"
                                            maxLength="150"
                                            required
                                        />
                                    </div>

                                    <div className="verification-field full-width">
                                        <label>Organization Type *</label>
                                        <select
                                            name="organizationType"
                                            value={verificationForm.organizationType}
                                            onChange={handleVerificationChange}
                                            required
                                        >
                                            <option value="">
                                                Select organization type
                                            </option>
                                            <option value="Ashrama">Ashrama</option>
                                            <option value="Orphanage">Orphanage</option>
                                            <option value="Old Age Home">Old Age Home</option>
                                            <option value="NGO">NGO</option>
                                            <option value="Community Kitchen">
                                                Community Kitchen
                                            </option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div className="verification-form-section">

                            <div className="verification-section-title">
                                <span>{isOrganization ? "03" : "02"}</span>
                                <div>
                                    <h3>
                                        {isOrganization
                                            ? "Contact Person Details"
                                            : "Your Information"}
                                    </h3>
                                    <p>
                                        {isOrganization
                                            ? "Provide details of the person responsible for food requests."
                                            : "Provide your contact information."}
                                    </p>
                                </div>
                            </div>

                            <div className="verification-fields-grid">

                                <div className="verification-field">
                                    <label>
                                        {isOrganization
                                            ? "Contact Person Name *"
                                            : "Full Name *"}
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={verificationForm.fullName}
                                        onChange={handleVerificationChange}
                                        placeholder="Enter full name"
                                        maxLength="100"
                                        required
                                    />
                                </div>

                                <div className="verification-field">
                                    <label>Phone Number *</label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={verificationForm.phone}
                                        onChange={handleVerificationChange}
                                        placeholder="Enter contact number"
                                        required
                                    />
                                </div>

                                <div className="verification-field full-width">
                                    <label>
                                        {isOrganization
                                            ? "Organization Address / Area *"
                                            : "Home Address / Area *"}
                                    </label>

                                    <input
                                        type="text"
                                        name="area"
                                        value={verificationForm.area}
                                        onChange={handleVerificationChange}
                                        placeholder="Enter your complete address or area"
                                        maxLength="150"
                                        required
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Food Assistance Details */}
                        <div className="verification-form-section">

                            <div className="verification-section-title">
                                <span>{isOrganization ? "04" : "03"}</span>
                                <div>
                                    <h3>Food Assistance Details</h3>
                                    <p>Help us understand how many people need support.</p>
                                </div>
                            </div>

                            <div className="verification-fields-grid">

                                <div className="verification-field full-width">
                                    <label>
                                        {isOrganization
                                            ? "Number of People Supported *"
                                            : "Number of People in Your Household *"}
                                    </label>

                                    <input
                                        type="number"
                                        name="peopleCount"
                                        value={verificationForm.peopleCount}
                                        onChange={handleVerificationChange}
                                        placeholder="Enter total number of people"
                                        min="1"
                                        step="1"
                                        required
                                    />

                                    <small>
                                        {isOrganization
                                            ? "Include everyone who regularly receives food from your organization."
                                            : "Include everyone in your household."}
                                    </small>
                                </div>

                                <div className="verification-field full-width">
                                    <label>Why are you requesting food assistance? *</label>

                                    <textarea
                                        name="reason"
                                        value={verificationForm.reason}
                                        onChange={handleVerificationChange}
                                        placeholder={
                                            isOrganization
                                                ? "Tell us about your organization and why it needs food assistance..."
                                                : "Tell us why your household needs food assistance..."
                                        }
                                        maxLength="500"
                                        required
                                    />

                                    <small>
                                        Maximum 500 characters.
                                    </small>
                                </div>

                                <div className="verification-field full-width">
                                    <label>Referral (Optional)</label>

                                    <input
                                        type="text"
                                        name="referral"
                                        value={verificationForm.referral}
                                        onChange={handleVerificationChange}
                                        placeholder="Name of person or organization that referred you"
                                        maxLength="200"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Form Feedback */}
                        {verificationMessage && (
                            <div className="verification-form-error">
                                {verificationMessage}
                            </div>
                        )}

                        <div className="verification-form-footer">
                            <p>
                                <strong>*</strong> Required fields
                            </p>

                            <div className="verification-form-actions">

                                <button
                                    type="button"
                                    className="verification-cancel-button"
                                    onClick={() =>
                                        setShowVerificationForm(false)
                                    }
                                    disabled={verificationSubmitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="verification-submit-button"
                                    disabled={verificationSubmitting}
                                >
                                    {verificationSubmitting
                                        ? "Submitting..."
                                        : verificationStatus === "Needs More Information"
                                            ? "Resubmit Application →"
                                            : "Submit Application →"}
                                </button>

                            </div>
                        </div>

                    </form>
                </section>
            )}

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
