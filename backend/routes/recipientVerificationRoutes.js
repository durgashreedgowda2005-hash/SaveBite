const express = require("express");
const RecipientVerification = require("../models/RecipientVerification");
const User = require("../models/UserTemp");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// RECIPIENT SUBMITS VERIFICATION APPLICATION
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Recipient"),
    async (req, res) => {
        try {
            const {
                fullName,
                phone,
                area,
                peopleCount,
                reason,
                referral
            } = req.body;

            if (
                !fullName?.trim() ||
                !phone?.trim() ||
                !area?.trim() ||
                peopleCount === undefined ||
                !reason?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required details."
                });
            }

            if (
                !Number.isInteger(Number(peopleCount)) ||
                Number(peopleCount) < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Number of people must be a positive whole number."
                });
            }

            const existingApplication =
                await RecipientVerification.findOne({
                    recipient: req.user.id
                });

            if (existingApplication) {
                return res.status(409).json({
                    success: false,
                    message: "You have already submitted a verification application."
                });
            }

            const application = await RecipientVerification.create({
                recipient: req.user.id,
                fullName,
                phone,
                area,
                peopleCount,
                reason,
                referral
            });

            await User.findByIdAndUpdate(req.user.id, {
                verificationStatus: "Pending"
            });

            res.status(201).json({
                success: true,
                message: "Verification application submitted successfully!",
                application
            });

        } catch (error) {
            console.error("Verification application error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while submitting your application."
            });
        }
    }
);
// RECIPIENT CHECKS THEIR APPLICATION STATUS
router.get(
    "/my-status",
    authMiddleware,
    roleMiddleware("Recipient"),
    async (req, res) => {
        try {
            const application = await RecipientVerification.findOne({
                recipient: req.user.id
            });

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "No verification application found."
                });
            }

            res.status(200).json({
                success: true,
                application
            });

        } catch (error) {
            console.error("Get verification status error:", error);

            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching your application."
            });
        }
    }
);
// Admin: View all recipient verification applications
router.get(
    "/admin/applications",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const applications = await RecipientVerification.find()
                .populate("recipient", "fullName email verificationStatus")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: applications.length,
                applications
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch verification applications.",
                error: error.message
            });
        }
    }
);
// Admin: Approve recipient verification application
router.put(
    "/admin/:applicationId/approve",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const application = await RecipientVerification.findById(
                req.params.applicationId
            );

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found."
                });
            }

            if (application.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending applications can be approved."
                });
            }

            application.status = "Approved";
            await application.save();

            await User.findByIdAndUpdate(
                application.recipient,
                { verificationStatus: "Approved" }
            );

            res.status(200).json({
                success: true,
                message: "Recipient application approved successfully!",
                application
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to approve application.",
                error: error.message
            });
        }
    }
);
// Admin: Reject recipient verification application
router.put(
    "/admin/:applicationId/reject",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const application = await RecipientVerification.findById(
                req.params.applicationId
            );

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found."
                });
            }

            if (application.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending applications can be rejected."
                });
            }

            application.status = "Rejected";
            application.adminNote = req.body.adminNote || "";
            await application.save();

            await User.findByIdAndUpdate(
                application.recipient,
                { verificationStatus: "Rejected" }
            );

            res.status(200).json({
                success: true,
                message: "Recipient application rejected successfully!",
                application
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to reject application.",
                error: error.message
            });
        }
    }
);
// Admin: Request more information from recipient
router.put(
    "/admin/:applicationId/request-info",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { adminNote } = req.body;

            if (!adminNote || !adminNote.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide the information required."
                });
            }

            const application = await RecipientVerification.findById(
                req.params.applicationId
            );

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found."
                });
            }

            if (application.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending applications can be updated."
                });
            }

            application.status = "Needs More Information";
            application.adminNote = adminNote.trim();
            await application.save();

            await User.findByIdAndUpdate(
                application.recipient,
                { verificationStatus: "Needs More Information" }
            );

            res.status(200).json({
                success: true,
                message: "Additional information requested successfully!",
                application
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to request additional information.",
                error: error.message
            });
        }
    }
);
module.exports = router;