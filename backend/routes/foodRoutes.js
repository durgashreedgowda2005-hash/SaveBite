
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");

const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");
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

// ADD FOOD API - DONORS ONLY
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

            if (!Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be at least 1."
                });
            }

            if (
                Number.isNaN(Date.parse(expiryTime)) ||
                new Date(expiryTime) <= new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Expiry time must be a valid future date."
                });
            }

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

// GET ALL FOOD LISTINGS OF LOGGED-IN DONOR
router.get(
    "/my-listings",
    authMiddleware,
    roleMiddleware("Donor"),
    async (req, res) => {
        try {
            const foods = await Food.find({
                donor: req.user.id
            })
                .populate("donor", "fullName email")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: foods.length,
                foods
            });

        } catch (error) {
            console.error("Get donor listings error:", error);

            res.status(500).json({
                success: false,
                message: "Could not fetch your food listings."
            });
        }
    }
);

// DELETE FOOD LISTING - DONOR OWNER ONLY
router.delete(
    "/:foodId",
    authMiddleware,
    roleMiddleware("Donor"),
    async (req, res) => {
        try {
            const { foodId } = req.params;

            if (!mongoose.isValidObjectId(foodId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid food listing ID."
                });
            }

            // Delete only a listing owned by the logged-in donor
            const deletedFood = await Food.findOneAndDelete({
                _id: foodId,
                donor: req.user.id
            });

            if (!deletedFood) {
                return res.status(404).json({
                    success: false,
                    message: "Food listing not found or you do not own it."
                });
            }

            // Reject outstanding requests linked to this food
            await FoodRequest.updateMany(
                {
                    food: foodId,
                    status: { $in: ["Pending", "Approved"] }
                },
                {
                    $set: { status: "Rejected" }
                }
            );

            // Remove uploaded image if it exists
            if (deletedFood.image) {
                try {
                    const imageName = path.basename(deletedFood.image);
                    const imagePath = path.join(
                        __dirname,
                        "..",
                        "uploads",
                        imageName
                    );

                    await fs.unlink(imagePath);
                } catch (imageError) {
                    if (imageError.code !== "ENOENT") {
                        console.error("Image deletion error:", imageError);
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: "Food listing deleted successfully!"
            });

        } catch (error) {
            console.error("Delete food error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while deleting the food listing."
            });
        }
    }
);

// GET ALL AVAILABLE FOOD - PUBLIC
router.get("/", async (req, res) => {
    try {
        const foods = await Food.find({
            status: "Available",
            expiryTime: { $gt: new Date() }
        }).populate("donor", "fullName email");

        res.status(200).json({
            success: true,
            count: foods.length,
            foods
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
