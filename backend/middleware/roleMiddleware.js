
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {

        // Check whether user information exists
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Please log in first."
            });
        }

        // Check whether user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You don't have permission."
            });
        }

        // Allow authorized user
        next();
    };
};

module.exports = roleMiddleware;
