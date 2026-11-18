
import { useState } from "react";
import "./Login.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
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
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const role = data.user.role;

                if (role === "Admin") {
                    window.location.href = "/admin";
                } else if (role === "Donor") {
                    window.location.href = "/donor";
                } else if (role === "Recipient") {
                    window.location.href = "/recipient";
                } else {
                    setMessage("Invalid user role.");
                    setMessageType("error");
                }
            } else {
                setMessage(data.message || "Invalid email or password.");
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
        <div className="login-page">

            {/* LEFT INTRODUCTION PANEL */}
            <div className="login-intro">
                <a href="/" className="login-brand">
                    🥬 Save<span>Bite</span>
                </a>

                <div className="login-intro-content">
                    <span className="login-tag">
                        💚 WELCOME BACK
                    </span>

                    <h1>
                        Good to See
                        <br />
                        <span>You Again!</span>
                    </h1>

                    <p>
                        Your little contribution can make a big difference.
                        Continue your journey towards a community with less
                        food waste and more sharing.
                    </p>

                    <div className="login-benefits">
                        <div>
                            <span>🥗</span>
                            <p>Discover and share available food.</p>
                        </div>

                        <div>
                            <span>🤝</span>
                            <p>Stay connected with your community.</p>
                        </div>

                        <div>
                            <span>🌱</span>
                            <p>Make every bite count.</p>
                        </div>
                    </div>
                </div>

                <div className="login-intro-footer">
                    Made with 💚 for a better tomorrow.
                </div>
            </div>

            {/* LOGIN FORM */}
            <div className="login-form-area">

                <div className="login-card">

                    <div className="login-heading">
                        <span className="login-heading-icon">🌿</span>

                        <h2>Welcome Back!</h2>

                        <p>
                            Login to access your SaveBite account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className="login-field">
                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <input
                                id="login-email"
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
                        <div className="login-field">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <div className="login-password-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login to SaveBite"}
                            {!loading && <span> →</span>}
                        </button>

                    </form>

                    {/* ERROR MESSAGE */}
                    {message && (
                        <div
                            className={`login-message ${messageType}`}
                            role="alert"
                        >
                            <span>!</span>
                            {message}
                        </div>
                    )}

                    <p className="register-link">
                        Don't have an account?
                        <a href="/register"> Create Account</a>
                    </p>

                    <a href="/" className="back-home">
                        ← Back to Home
                    </a>

                </div>

            </div>
        </div>
    );
}

export default Login;
