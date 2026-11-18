
import { useState, useEffect } from "react";
import Register from "./pages/Register";
import AdminDashboard from "./admin/AdminDashboard";
import RecipientDashboard from "./recipient/RecipientDashboard";
import DonorDashboard from "./donor/DonorDashboard";
import Login from "./pages/Login";
import "./App.css";
import "./index.css";

const API_URL = "http://localhost:5000/api";
const IMAGE_URL = "http://localhost:5000";

function App() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFood, setSelectedFood] = useState(null);

    const path = window.location.pathname;

    useEffect(() => {
        if (path !== "/") return;

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
                setLoading(false);
            }
        };

        fetchFoods();
    }, [path]);

    // Close food popup using Escape key
    useEffect(() => {
        if (!selectedFood) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setSelectedFood(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [selectedFood]);

    if (path === "/register") return <Register />;
    if (path === "/login") return <Login />;
    if (path === "/admin") return <AdminDashboard />;
    if (path === "/recipient") return <RecipientDashboard />;
    if (path === "/donor") return <DonorDashboard />;

    return (
        <div className="app">

            {/* NAVBAR */}
            <nav className="navbar">
                <a href="/" className="logo">
                    <span className="logo-icon">🥬</span>
                    Save<span>Bite</span>
                </a>

                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About Us</a>
                    <a href="#food">Available Food</a>
                    <a href="#impact">Our Impact</a>
                </div>

                <div className="nav-buttons">
                    <a href="/login" className="login-btn">Login</a>
                    <a href="/register" className="register-btn">Get Started</a>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <span className="hero-tag">
                        🌱 FOOD SHARING. COMMUNITY CARING.
                    </span>

                    <h1>
                        Good Food Deserves
                        <span> Another Chance.</span>
                    </h1>

                    <p className="hero-description">
                        Every day, good food goes to waste while people
                        need it. SaveBite connects surplus food with
                        people who need it. Let's make every bite count.
                    </p>

                    <div className="hero-buttons">
                        <a href="#food" className="primary-btn">
                            Explore Food <span>→</span>
                        </a>

                        <a href="/register?role=Donor" className="secondary-btn">
                            Donate Food <span>💚</span>
                        </a>
                    </div>

                    <div className="hero-note">
                        <span>✓</span> Share food. Reduce waste. Spread kindness.
                    </div>
                </div>

                <div className="hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1000"
                        alt="Fresh vegetables and healthy food"
                    />

                    <div className="hero-floating-card">
                        <span className="floating-icon">💚</span>
                        <div>
                            <strong>Food has value.</strong>
                            <p>Let's not waste it.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HIGHLIGHTS */}
            <section className="highlights">
                <div className="highlight-item">
                    <span>🥗</span>
                    <div>
                        <h3>Save Good Food</h3>
                        <p>Give surplus food a second chance.</p>
                    </div>
                </div>

                <div className="highlight-item">
                    <span>🤝</span>
                    <div>
                        <h3>Help Communities</h3>
                        <p>Connect donors with recipients.</p>
                    </div>
                </div>

                <div className="highlight-item">
                    <span>🌍</span>
                    <div>
                        <h3>Reduce Food Waste</h3>
                        <p>Build a more sustainable future.</p>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="about section-padding" id="about">
                <div className="about-image">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900"
                        alt="Fresh produce at a food market"
                    />
                    <div className="about-image-label">
                        Small actions create big changes 🌱
                    </div>
                </div>

                <div className="about-content">
                    <span className="section-tag">ABOUT SAVEBITE</span>
                    <h2>A Little Sharing Can Make a Big Difference.</h2>

                    <p>
                        SaveBite is a food-sharing platform designed to
                        connect people who have surplus food with people
                        who need it.
                    </p>

                    <p>
                        Instead of letting good food go to waste, donors
                        can share it with verified recipients through
                        one simple platform.
                    </p>

                    <a href="/register" className="text-link">
                        Become a part of SaveBite →
                    </a>
                </div>
            </section>

            {/* FOOD LISTINGS */}
            <section className="food-section section-padding" id="food">
                <div className="section-heading">
                    <span className="section-tag">FRESHLY SHARED</span>
                    <h2>Discover Available Food</h2>
                    <p>
                        Explore food shared by generous donors in the community.
                        Click on any card to see more details!
                    </p>
                </div>

                {loading ? (
                    <div className="loading-message">
                        <span className="loading-spinner"></span>
                        Loading available food...
                    </div>
                ) : foods.length === 0 ? (
                    <div className="empty-food-message">
                        <span>🥗</span>
                        <h3>No food listings yet</h3>
                        <p>New food listings will appear here. Check back soon!</p>
                    </div>
                ) : (
                    <div className="food-cards">
                        {foods.map((food) => (
                            <article
                                className="food-card clickable-food-card"
                                key={food._id}
                                onClick={() => setSelectedFood(food)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        setSelectedFood(food);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`View details for ${food.foodName}`}
                            >
                                <div className="food-card-image">
                                    {food.image ? (
                                        <img
                                            src={`${IMAGE_URL}${food.image}`}
                                            alt={food.foodName}
                                        />
                                    ) : (
                                        <div className="food-image-placeholder">
                                            🥗
                                        </div>
                                    )}

                                    <span className="food-status">
                                        {food.status}
                                    </span>
                                </div>

                                <div className="food-info">
                                    <span className="food-category">
                                        {food.category}
                                    </span>

                                    <h3>{food.foodName}</h3>

                                    <p className="food-description">
                                        {food.description}
                                    </p>

                                    <div className="food-detail">
                                        <span>📦 Quantity</span>
                                        <strong>
                                            {food.quantity} {food.unit}
                                        </strong>
                                    </div>

                                    <div className="food-detail">
                                        <span>📍 Location</span>
                                        <strong>{food.pickupAddress}</strong>
                                    </div>

                                    <div className="food-detail">
                                        <span>⏰ Expires</span>
                                        <strong>
                                            {new Date(food.expiryTime).toLocaleDateString()}
                                        </strong>
                                    </div>

                                    <div className="view-food-btn">
                                        View Details <span>↗</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* FOOD DETAILS POPUP */}
            {selectedFood && (
                <div
                    className="food-modal-overlay"
                    onClick={() => setSelectedFood(null)}
                >
                    <div
                        className="food-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${selectedFood.foodName} details`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="food-modal-close"
                            onClick={() => setSelectedFood(null)}
                            aria-label="Close popup"
                        >
                            ×
                        </button>

                        <div className="food-modal-image">
                            {selectedFood.image ? (
                                <img
                                    src={`${IMAGE_URL}${selectedFood.image}`}
                                    alt={selectedFood.foodName}
                                />
                            ) : (
                                <div className="food-image-placeholder">
                                    🥗
                                </div>
                            )}
                        </div>

                        <div className="food-modal-content">
                            <span className="food-category">
                                {selectedFood.category}
                            </span>

                            <h2>{selectedFood.foodName}</h2>

                            <span className="food-status">
                                {selectedFood.status}
                            </span>

                            <p className="food-modal-description">
                                {selectedFood.description}
                            </p>

                            <div className="food-modal-details">
                                <div>
                                    <span>📦 Available Quantity</span>
                                    <strong>
                                        {selectedFood.quantity} {selectedFood.unit}
                                    </strong>
                                </div>

                                <div>
                                    <span>📍 Pickup Location</span>
                                    <strong>{selectedFood.pickupAddress}</strong>
                                </div>

                                <div>
                                    <span>⏰ Expiry Date</span>
                                    <strong>
                                        {new Date(selectedFood.expiryTime).toLocaleDateString()}
                                    </strong>
                                </div>
                            </div>

                            <a
                                href="/login"
                                className="food-modal-login-btn"
                            >
                                Login to Request Food 💚
                            </a>

                            <p className="food-modal-note">
                                Please log in to your recipient account to request food.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* IMPACT */}
            <section className="impact section-padding" id="impact">
                <div className="section-heading">
                    <span className="section-tag">OUR MISSION</span>
                    <h2>Every Bite Makes a Difference.</h2>
                    <p>
                        Together, we can create a community where good food
                        reaches the people who need it.
                    </p>
                </div>

                <div className="impact-stats">
                    <div className="impact-card">
                        <span>🍱</span>
                        <h3>{foods.length}</h3>
                        <p>Available Food Listings</p>
                    </div>

                    <div className="impact-card">
                        <span>💚</span>
                        <h3>Community</h3>
                        <p>Food Donors</p>
                    </div>

                    <div className="impact-card">
                        <span>🤝</span>
                        <h3>Together</h3>
                        <p>Helping Recipients</p>
                    </div>
                </div>
            </section>

            {/* JOIN SECTION */}
            <section className="join-section">
                <div>
                    <span>🌱 JOIN THE SAVEBITE COMMUNITY</span>
                    <h2>Good Food. Good People. A Better Tomorrow.</h2>
                    <p>
                        Whether you want to donate surplus food or receive
                        food, you can make a difference.
                    </p>
                </div>

                <a href="/register" className="join-btn">
                    Join SaveBite →
                </a>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-main">
                    <div>
                        <a href="/" className="logo footer-logo">
                            🥬 Save<span>Bite</span>
                        </a>
                        <p>
                            Saving food today,<br />
                            creating a better tomorrow.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Explore</h3>
                        <a href="#home">Home</a>
                        <a href="#about">About Us</a>
                        <a href="#food">Available Food</a>
                        <a href="#impact">Our Impact</a>
                    </div>

                    <div className="footer-links">
                        <h3>Get Started</h3>
                        <a href="/login">Login</a>
                        <a href="/register">Register</a>
                        <a href="/register?role=Donor">Donate Food</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 SaveBite. All rights reserved.</p>
                    <p>Made with 💚 for a better tomorrow.</p>
                </div>
            </footer>

        </div>
    );
}

export default App;
