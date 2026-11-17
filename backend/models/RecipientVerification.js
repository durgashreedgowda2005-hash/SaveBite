const mongoose = require("mongoose");

const recipientVerificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        area: {
            type: String,
            required: true,
            trim: true
        },

        peopleCount: {
            type: Number,
            required: true,
            min: 1
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        referral: {
            type: String,
            trim: true,
            maxlength: 200
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",
                "Needs More Information"
            ],
            default: "Pending"
        },

        adminNote: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    { timestamps: true }
);

const RecipientVerification = mongoose.model(
    "RecipientVerification",
    recipientVerificationSchema
);

module.exports = RecipientVerification;