/**
 * Middleware to check if a user has admin privileges.
 * Since full auth is not yet implemented, we look for 'admin=true' in query params
 * or mock a user object.
 */
const checkAdmin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

module.exports = {
    checkAdmin
};
