
import { useState } from "react";
import "./Login.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
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

                setMessage("Login successful!");

                const role = data.user.role;

                if (role === "Admin") {
                    window.location.href = "/admin";
                } else if (role === "Donor") {
                    window.location.href = "/donor";
                } else if (role === "Recipient") {
                    window.location.href = "/recipient";
                } else {
                    setMessage("Invalid user role.");
                }
            } else {
                setMessage(data.message || "Invalid email or password.");
            }
        } catch (error) {
            setMessage("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>Welcome to <span>SaveBite</span></h1>

                <p className="login-subtitle">
                    Login to continue your journey with us.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {message && (
                    <p className="login-message">{message}</p>
                )}

                <p className="register-link">
                    Don't have an account? <a href="/register">Register</a>
                </p>

                <a href="/" className="back-home">
                    ← Back to Home
                </a>

            </div>

        </div>
    );
}

export default Login;
