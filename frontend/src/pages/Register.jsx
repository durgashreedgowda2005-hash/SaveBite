
import { useState } from "react";
import "./Register.css";

function Register() {
    const params = new URLSearchParams(window.location.search);
    const requestedRole = params.get("role");

    const initialRole =
        requestedRole === "Donor" || requestedRole === "Recipient"
            ? requestedRole
            : "Recipient";

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: initialRole
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (role) => {
        setFormData({
            ...formData,
            role
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Registration successful! You can now log in.");
                setMessageType("success");

                setFormData({
                    fullName: "",
                    email: "",
                    password: "",
                    role: initialRole
                });
            } else {
                setMessage(data.message || "Registration failed.");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("Unable to connect to the server. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            {/* LEFT INTRODUCTION PANEL */}
            <div className="register-intro">
                <a href="/" className="register-brand">
                    🥬 Save<span>Bite</span>
                </a>

                <div className="register-intro-content">
                    <span className="register-tag">
                        🌱 FOOD SHARING. COMMUNITY CARING.
                    </span>

                    <h1>
                        Small Acts.
                        <br />
                        <span>Big Impact.</span>
                    </h1>

                    <p>
                        Join a community that believes good food should
                        reach people, not go to waste.
                    </p>

                    <div className="register-benefits">
                        <div>
                            <span>💚</span>
                            <p>Share surplus food with people who need it.</p>
                        </div>

                        <div>
                            <span>🤝</span>
                            <p>Connect with a caring community.</p>
                        </div>

                        <div>
                            <span>🌍</span>
                            <p>Take a step towards reducing food waste.</p>
                        </div>
                    </div>
                </div>

                <div className="register-intro-footer">
                    Made with 💚 for a better tomorrow.
                </div>
            </div>

            {/* REGISTRATION FORM */}
            <div className="register-form-area">

                <div className="register-card">

                    <div className="register-heading">
                        <span className="register-heading-icon">🌿</span>

                        <h2>Create Your Account</h2>

                        <p>
                            Become a part of the SaveBite community.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* FULL NAME */}
                        <div className="register-field">
                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>

                        {/* EMAIL */}
                        <div className="register-field">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="register-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength="6"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <small>Use at least 6 characters.</small>
                        </div>

                        {/* ROLE SELECTION */}
                        <div className="register-field">
                            <label>How would you like to join?</label>

                            <div className="role-selection">

                                <button
                                    type="button"
                                    className={`role-card ${formData.role === "Recipient" ? "active" : ""}`}
                                    onClick={() => handleRoleChange("Recipient")}
                                >
                                    <span className="role-icon">🤲</span>

                                    <strong>Recipient</strong>

                                    <small>
                                        I need food
                                    </small>

                                    {formData.role === "Recipient" && (
                                        <span className="role-check">✓</span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className={`role-card ${formData.role === "Donor" ? "active" : ""}`}
                                    onClick={() => handleRoleChange("Donor")}
                                >
                                    <span className="role-icon">🥗</span>

                                    <strong>Donor</strong>

                                    <small>
                                        I want to share food
                                    </small>

                                    {formData.role === "Donor" && (
                                        <span className="role-check">✓</span>
                                    )}
                                </button>

                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="register-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create My Account"}
                            {!loading && <span> →</span>}
                        </button>

                    </form>

                    {/* SUCCESS / ERROR MESSAGE */}
                    {message && (
                        <div
                            className={`register-message ${messageType}`}
                            role="alert"
                        >
                            <span>
                                {messageType === "success" ? "✓" : "!"}
                            </span>

                            {message}
                        </div>
                    )}

                    <p className="login-link">
                        Already have an account?
                        <a href="/login"> Login</a>
                    </p>

                    <a href="/" className="back-home">
                        ← Back to Home
                    </a>

                </div>

            </div>
        </div>
    );
}

export default Register;
