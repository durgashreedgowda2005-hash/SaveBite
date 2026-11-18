
const express = require("express");
const RecipientVerification = require("../models/RecipientVerification");
const User = require("../models/UserTemp");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const organizationTypes = [
    "Ashrama",
    "Orphanage",
    "Old Age Home",
    "NGO",
    "Community Kitchen",
    "Other"
];

// Validate recipient application details
const validateApplication = (body) => {
    const {
        recipientType,
        organizationName,
        organizationType,
        fullName,
        phone,
        area,
        peopleCount,
        reason,
        referral
    } = body;

    if (!["Individual", "Organization"].includes(recipientType)) {
        return "Please select Individual or Organization.";
    }

    if (
        typeof fullName !== "string" ||
        !fullName.trim() ||
        typeof phone !== "string" ||
        !phone.trim() ||
        typeof area !== "string" ||
        !area.trim() ||
        typeof reason !== "string" ||
        !reason.trim() ||
        peopleCount === undefined ||
        peopleCount === ""
    ) {
        return "Please provide all required details.";
    }

    if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
        return "Please enter a valid phone number.";
    }

    if (
        !Number.isInteger(Number(peopleCount)) ||
        Number(peopleCount) < 1
    ) {
        return "Number of people must be a positive whole number.";
    }

    if (reason.trim().length > 500) {
        return "Reason cannot exceed 500 characters.";
    }

    if (
        referral !== undefined &&
        (typeof referral !== "string" || referral.length > 200)
    ) {
        return "Referral cannot exceed 200 characters.";
    }

    if (recipientType === "Organization") {
        if (
            typeof organizationName !== "string" ||
            !organizationName.trim()
        ) {
            return "Please enter your organization name.";
        }

        if (organizationName.trim().length > 150) {
            return "Organization name cannot exceed 150 characters.";
        }

        if (!organizationTypes.includes(organizationType)) {
            return "Please select a valid organization type.";
        }
    }

    return null;
};

// Prepare application data
const getApplicationData = (body) => {
    const isOrganization = body.recipientType === "Organization";

    return {
        recipientType: body.recipientType,
        organizationName: isOrganization
            ? body.organizationName.trim()
            : "",
        organizationType: isOrganization
            ? body.organizationType
            : "",
        fullName: body.fullName.trim(),
        phone: body.phone.trim(),
        area: body.area.trim(),
        peopleCount: Number(body.peopleCount),
        reason: body.reason.trim(),
        referral: body.referral?.trim() || ""
    };
};


// ==========================================
// RECIPIENT: SUBMIT VERIFICATION APPLICATION
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("Recipient"),
    async (req, res) => {
        try {
            const validationError = validateApplication(req.body);

            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError
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
                ...getApplicationData(req.body)
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


// ==========================================
// RECIPIENT: CHECK APPLICATION STATUS
// ==========================================

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


// ==========================================
// RECIPIENT: UPDATE AND RESUBMIT APPLICATION
// ==========================================

router.put(
    "/my-application",
    authMiddleware,
    roleMiddleware("Recipient"),
    async (req, res) => {
        try {
            const validationError = validateApplication(req.body);

            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError
                });
            }

            const application = await RecipientVerification.findOne({
                recipient: req.user.id
            });

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Verification application not found."
                });
            }

            if (application.status !== "Needs More Information") {
                return res.status(400).json({
                    success: false,
                    message: "Your application cannot be edited at this stage."
                });
            }

            Object.assign(
                application,
                getApplicationData(req.body)
            );

            application.status = "Pending";
            application.adminNote = "";

            await application.save();

            await User.findByIdAndUpdate(req.user.id, {
                verificationStatus: "Pending"
            });

            res.status(200).json({
                success: true,
                message: "Application updated and resubmitted successfully!",
                application
            });

        } catch (error) {
            console.error("Resubmission error:", error);

            res.status(500).json({
                success: false,
                message: "Server error while resubmitting application."
            });
        }
    }
);


// ==========================================
// ADMIN: VIEW ALL APPLICATIONS
// ==========================================

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


// ==========================================
// ADMIN: APPROVE APPLICATION
// ==========================================

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


// ==========================================
// ADMIN: REJECT APPLICATION
// ==========================================

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


// ==========================================
// ADMIN: REQUEST MORE INFORMATION
// ==========================================

router.put(
    "/admin/:applicationId/request-info",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { adminNote } = req.body;

            if (
                typeof adminNote !== "string" ||
                !adminNote.trim() ||
                adminNote.trim().length > 500
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide the required information (maximum 500 characters)."
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
