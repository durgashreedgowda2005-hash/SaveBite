
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const foodRoutes = require("./routes/foodRoutes");
const foodRequestRoutes = require("./routes/foodRequestRoutes");
const recipientVerificationRoutes = require("./routes/recipientVerificationRoutes");

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded food images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/food-requests", foodRequestRoutes);
app.use("/api/recipient-verification", recipientVerificationRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to SaveBite Backend!");
});

// Test API route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "SaveBite API is working!"
    });
});

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "You have accessed a protected route!",
        user: req.user
    });
});

// Donor-only test route
app.get(
    "/api/donor-only",
    authMiddleware,
    roleMiddleware("Donor"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome, Donor! You have permission to access this route."
        });
    }
);

// Server port
const PORT = process.env.PORT || 5000;

// Connect database and start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`SaveBite server running on port ${PORT}`);
    });
};

startServer();
