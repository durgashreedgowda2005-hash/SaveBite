
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`SaveBite server running on port ${PORT}`);
});
