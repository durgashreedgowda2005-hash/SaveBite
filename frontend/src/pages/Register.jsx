
import { useState } from "react";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "Recipient"
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
                setFormData({
                    fullName: "",
                    email: "",
                    password: "",
                    role: "Recipient"
                });
            } else {
                setMessage(data.message || "Registration failed.");
            }
        } catch (error) {
            setMessage("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <h1>Join <span>SaveBite</span></h1>

                <p className="register-subtitle">
                    Be a part of the movement to reduce food waste.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength="6"
                        required
                    />

                    <label>Register As</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="Recipient">Recipient</option>
                        <option value="Donor">Donor</option>
                    </select>

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                {message && (
                    <p className="register-message">{message}</p>
                )}

                <p className="login-link">
                    Already have an account? <a href="/login">Login</a>
                </p>

                <a href="/" className="back-home">
                    ← Back to Home
                </a>

            </div>

        </div>
    );
}

export default Register;
