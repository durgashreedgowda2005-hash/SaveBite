const roleMiddleware = require("./roleMiddleware");

const adminMiddleware = roleMiddleware("Admin");

module.exports = adminMiddleware;
