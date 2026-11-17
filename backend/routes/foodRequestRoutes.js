const express = require("express");
const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/UserTemp");
const router = express.Router();

// RECIPIENT REQUESTS FOOD
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Recipient"),
    async (req, res) => {
        try {
            const recipient = await User.findById(req.user.id);

if (!recipient || recipient.verificationStatus !== "Approved") {
    return res.status(403).json({
        success: false,
        message: "Your account must be verified before requesting food."
    });
}
            const { foodId, quantityRequested, message } = req.body;

            if (!foodId || !quantityRequested) {
                return res.status(400).json({
                    success: false,
                    message: "Food ID and requested quantity are required."
                });
            }

            if (!Number.isInteger(Number(quantityRequested)) ||
                Number(quantityRequested) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity must be a positive whole number."
                });
            }

            const food = await Food.findOne({
                _id: foodId,
                status: "Available",
                expiryTime: { $gt: new Date() }
            });

            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: "Food is unavailable or has expired."
                });
            }

            if (Number(quantityRequested) > food.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available quantity."
                });
            }

            if (food.donor.toString() === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot request your own food listing."
                });
            }

            const newRequest = await FoodRequest.create({
                food: food._id,
                recipient: req.user.id,
                donor: food.donor,
                quantityRequested: Number(quantityRequested),
                message
            });

            res.status(201).json({
                success: true,
                message: "Food request submitted successfully!",
                request: newRequest
            });

        } catch (error) {
            console.error("Food request error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while requesting food."
            });
        }
    }
);
// DONOR VIEWS FOOD REQUESTS
router.get(
    "/donor",
    authMiddleware,
    roleMiddleware("Donor"),
    async (req, res) => {
        try {
            const requests = await FoodRequest.find({
                donor: req.user.id
            })
                .populate("food", "foodName quantity unit pickupAddress")
                .populate("recipient", "fullName email")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: requests.length,
                requests: requests
            });

        } catch (error) {
            console.error("Get donor requests error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching requests."
            });
        }
    }
);
// DONOR APPROVES FOOD REQUEST
router.put(
    "/:requestId/approve",
    authMiddleware,
    roleMiddleware("Donor"),
    async (req, res) => {
        try {
            const { requestId } = req.params;

            if (!require("mongoose").isValidObjectId(requestId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID."
                });
            }

            const foodRequest = await FoodRequest.findOne({
                _id: requestId,
                donor: req.user.id,
                status: "Pending"
            });

            if (!foodRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Pending food request not found."
                });
            }

            const food = await Food.findOneAndUpdate(
                {
                    _id: foodRequest.food,
                    status: "Available",
                    expiryTime: { $gt: new Date() },
                    quantity: { $gte: foodRequest.quantityRequested }
                },
                {
                    $inc: {
                        quantity: -foodRequest.quantityRequested
                    }
                },
                { new: true }
            );

            if (!food) {
                return res.status(400).json({
                    success: false,
                    message: "Not enough food is available, or the listing has expired."
                });
            }

            if (food.quantity === 0) {
                food.status = "Reserved";
                await food.save();
            }

            const updatedRequest = await FoodRequest.findOneAndUpdate(
                {
                    _id: requestId,
                    donor: req.user.id,
                    status: "Pending"
                },
                { status: "Approved" },
                { new: true }
            );

            if (!updatedRequest) {
                await Food.findByIdAndUpdate(food._id, {
                    $inc: {
                        quantity: foodRequest.quantityRequested
                    },
                    $set: {
                        status: "Available"
                    }
                });

                return res.status(409).json({
                    success: false,
                    message: "This request has already been processed."
                });
            }

            res.status(200).json({
                success: true,
                message: "Food request approved successfully!",
                request: updatedRequest,
                remainingQuantity: food.quantity
            });

        } catch (error) {
            console.error("Approve request error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while approving the request."
            });
        }
    }
);
// DONOR REJECTS FOOD REQUEST
router.put(
    "/:requestId/reject",
    authMiddleware,
    roleMiddleware("Donor"),
    async (req, res) => {
        try {
            const { requestId } = req.params;

            if (!require("mongoose").isValidObjectId(requestId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID."
                });
            }

            const updatedRequest = await FoodRequest.findOneAndUpdate(
                {
                    _id: requestId,
                    donor: req.user.id,
                    status: "Pending"
                },
                {
                    status: "Rejected"
                },
                {
                    new: true
                }
            );

            if (!updatedRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Pending food request not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Food request rejected successfully!",
                request: updatedRequest
            });

        } catch (error) {
            console.error("Reject request error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while rejecting the request."
            });
        }
    }
);
// RECIPIENT VIEWS THEIR OWN REQUESTS
router.get(
    "/my-requests",
    authMiddleware,
    roleMiddleware("Recipient"),
    async (req, res) => {
        try {
            const requests = await FoodRequest.find({
                recipient: req.user.id
            })
                .populate("food", "foodName quantity unit pickupAddress")
                .populate("donor", "fullName email")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: requests.length,
                requests: requests
            });

        } catch (error) {
            console.error("Get recipient requests error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching your requests."
            });
        }
    }
);
// DONOR MARKS FOOD AS COLLECTED
router.put(
    "/:requestId/collect",
    authMiddleware,
    roleMiddleware("Donor"),
    async (req, res) => {
        try {
            const { requestId } = req.params;

            if (!require("mongoose").isValidObjectId(requestId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request ID."
                });
            }

            const updatedRequest = await FoodRequest.findOneAndUpdate(
                {
                    _id: requestId,
                    donor: req.user.id,
                    status: "Approved"
                },
                {
                    status: "Collected"
                },
                {
                    new: true
                }
            );

            if (!updatedRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Approved food request not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Food marked as collected successfully!",
                request: updatedRequest
            });

        } catch (error) {
            console.error("Collection update error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while updating collection status."
            });
        }
    }
);
module.exports = router;