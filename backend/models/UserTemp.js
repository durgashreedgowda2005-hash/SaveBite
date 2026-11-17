
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
    type: String,
    enum: ["Donor", "Recipient", "Admin"],
    required: true
},

verificationStatus: {
    type: String,
    enum: ["Not Submitted", "Pending", "Approved", "Rejected", "Needs More Information"],
    default: "Not Submitted"
}
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
