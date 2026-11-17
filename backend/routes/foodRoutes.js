
const express = require("express");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Handle image upload errors
const handleImageUpload = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next();
    });
};

// ADD FOOD API - Donors only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Donor"),
    handleImageUpload,
    async (req, res) => {
        try {
            const {
                foodName,
                description,
                category,
                quantity,
                unit,
                pickupAddress,
                expiryTime
            } = req.body;

            // Check required fields
            if (
                !foodName ||
                !description ||
                !category ||
                quantity === undefined ||
                !unit ||
                !pickupAddress ||
                !expiryTime
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required food details."
                });
            }

            // Validate quantity
            if (!Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be at least 1."
                });
            }

            // Validate expiry time
            if (
                Number.isNaN(Date.parse(expiryTime)) ||
                new Date(expiryTime) <= new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Expiry time must be a valid future date."
                });
            }

            // Create food listing
            const newFood = await Food.create({
                foodName,
                description,
                category,
                quantity,
                unit,
                pickupAddress,
                expiryTime,
                image: req.file ? `/uploads/${req.file.filename}` : "",
                donor: req.user.id
            });

            res.status(201).json({
                success: true,
                message: "Food listed successfully!",
                food: newFood
            });

        } catch (error) {
            console.error("Add food error:", error);

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: "Something went wrong while adding food."
            });
        }
    }
);

// GET ALL AVAILABLE FOOD
router.get("/", async (req, res) => {
    try {
        const foods = await Food.find({
            status: "Available",
            expiryTime: { $gt: new Date() }
        }).populate("donor", "fullName email");

        res.status(200).json({
            success: true,
            count: foods.length,
            foods: foods
        });

    } catch (error) {
        console.error("Get foods error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching food listings."
        });
    }
});

module.exports = router;
