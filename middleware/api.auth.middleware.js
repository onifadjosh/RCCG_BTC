/**
 * Middleware to check if a user has admin privileges (API version).
 * Returns JSON error instead of redirecting.
 */
const apiCheckAdmin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized. Admin session required." });
    }
};

module.exports = {
    apiCheckAdmin
};
