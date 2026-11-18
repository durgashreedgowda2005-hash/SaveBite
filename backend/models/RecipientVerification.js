
const mongoose = require("mongoose");

const recipientVerificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Individual or Organization
        recipientType: {
            type: String,
            enum: ["Individual", "Organization"],
            default: "Individual",
            required: true
        },

        // Organization details
        organizationName: {
            type: String,
            trim: true,
            maxlength: 150
        },

        organizationType: {
            type: String,
            enum: [
                "Ashrama",
                "Orphanage",
                "Old Age Home",
                "NGO",
                "Community Kitchen",
                "Other",
                ""
            ],
            default: ""
        },

        // Applicant or organization's contact person
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

        // Number of people receiving food
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
