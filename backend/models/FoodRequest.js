const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema(
    {
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        quantityRequested: {
            type: Number,
            required: true,
            min: 1
        },

        message: {
            type: String,
            trim: true,
            maxlength: 300
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Collected"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

const FoodRequest = mongoose.model("FoodRequest", foodRequestSchema);

module.exports = FoodRequest;