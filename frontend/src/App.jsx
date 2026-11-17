
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
    if (window.location.pathname === "/register") {
    return <Register />;
}
if (window.location.pathname === "/login") {
    return <Login />;
}
    // Existing dashboard routes
    if (window.location.pathname === "/admin") {
        return <AdminDashboard />;
    }

    if (window.location.pathname === "/recipient") {
        return <RecipientDashboard />;
    }

    if (window.location.pathname === "/donor") {
        return <DonorDashboard />;
    }

    // Fetch real available food from backend
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
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    return (
        <div className="app">

            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="logo">
                    Save<span>Bite</span>
                </div>

                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                    <a href="#food">Available Food</a>
                    <a href="#impact">Our Impact</a>
                </div>

                <div className="nav-buttons">
                    <a href="/login" className="login-btn">
                        Login
                    </a>

                    <a href="/register" className="register-btn">
                        Register
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <p className="tagline">
                        SAVE FOOD • SHARE HOPE
                    </p>

                    <h1>
                        Good Food Deserves
                        <span> Another Chance.</span>
                    </h1>

                    <p className="hero-description">
                        Connecting surplus food with people who need it.
                        Together, we can reduce food waste and make a difference.
                    </p>

                    <div className="hero-buttons">
                        <a href="#food" className="primary-btn">
                            Explore Food
                        </a>

                        <a href="/register?role=Donor" className="secondary-btn">
                            Donate Food
                        </a>
                    </div>
                </div>

                <div className="hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900"
                        alt="Fresh and healthy food"
                    />
                </div>
            </section>

            {/* About Section */}
            <section className="about" id="about">
                <p className="section-tag">WHY SAVEBITE?</p>

                <h2>Small Actions, Big Impact</h2>

                <p>
                    SaveBite is a platform that helps restaurants, shops and
                    individuals share their surplus food with people who need it.
                    Instead of wasting good food, let's give it a second chance.
                </p>
            </section>

            {/* Available Food Section */}
            <section className="food-section" id="food">
                <p className="section-tag">DISCOVER FOOD</p>

                <h2>Food That Needs a New Home</h2>

                <p>
                    Explore surplus food shared by donors in your community.
                </p>

                {loading ? (
                    <p>Loading available food...</p>
                ) : foods.length === 0 ? (
                    <div className="empty-food-message">
                        No food listings are currently available.
                        Check back soon!
                    </div>
                ) : (
                    <div className="food-cards">
                        {foods.map((food) => (
                            <div className="food-card" key={food._id}>

                                {food.image ? (
                                    <img
                                        src={`${IMAGE_URL}${food.image}`}
                                        alt={food.foodName}
                                    />
                                ) : (
                                    <div className="food-image-placeholder">
                                        No Image Available
                                    </div>
                                )}

                                <span className="food-status">
                                    {food.status}
                                </span>

                                <div className="food-info">
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
                                        <strong>Location:</strong>{" "}
                                        {food.pickupAddress}
                                    </p>

                                    <p>
                                        <strong>Expiry:</strong>{" "}
                                        {new Date(food.expiryTime).toLocaleString()}
                                    </p>

                                    <a
                                        href="/login"
                                        className="view-food-btn"
                                    >
                                        Login to Request
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Impact Section */}
            <section className="impact" id="impact">
                <p className="section-tag">OUR MISSION</p>

                <h2>Every Bite Makes a Difference</h2>

                <div className="impact-stats">
                    <div>
                        <h3>{foods.length}</h3>
                        <p>Available Food Listings</p>
                    </div>

                    <div>
                        <h3>0+</h3>
                        <p>Food Donors</p>
                    </div>

                    <div>
                        <h3>0+</h3>
                        <p>Happy Recipients</p>
                    </div>
                </div>
            </section>

            {/* Join SaveBite */}
            <section className="about">
                <p className="section-tag">BECOME A PART OF SAVEBITE</p>

                <h2>Together, We Can Make a Difference</h2>

                <p>
                    Whether you want to donate surplus food or receive food,
                    there's a place for you in the SaveBite community.
                </p>

                <a href="/register" className="primary-btn">
                    Join SaveBite
                </a>
            </section>

            {/* Footer */}
            <footer className="footer">
                <h2>Save<span>Bite</span></h2>

                <p>
                    Saving food today, creating a better tomorrow.
                </p>

                <p>
                    © 2026 SaveBite. All rights reserved.
                </p>
            </footer>

        </div>
    );
}

export default App;
