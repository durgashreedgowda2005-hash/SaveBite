
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
    {
        foodName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: ["Meals", "Bakery", "Fruits", "Vegetables", "Dairy", "Other"],
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        unit: {
            type: String,
            enum: ["Meals", "Packets", "Kg", "Litres", "Pieces"],
            required: true
        },

        pickupAddress: {
            type: String,
            required: true,
            trim: true
        },

        expiryTime: {
            type: Date,
            required: true
        },

        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["Available", "Reserved", "Collected", "Expired"],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
