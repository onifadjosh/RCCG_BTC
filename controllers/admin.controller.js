const UserModel = require("../models/user.model");
const { renderTemplate, transporter } = require("../middleware/mail.sender");

/**
 * Display the admin dashboard with all subscribers.
 */
const getAdminDashboard = async (req, res) => {
    try {
        const users = await UserModel.find({ role: 'user' }).sort({ createdAt: -1 });
        res.render("AdminDashboard", { 
            users, 
            status: req.query.status ? JSON.parse(decodeURIComponent(req.query.status)) : null 
        });
    } catch (error) {
        console.error("Admin error:", error);
        res.status(500).send("Internal Server Error");
    }
};

/**
 * Send bulk newsletter to selected users.
 */
const sendBulkNewsletter = async (req, res) => {
    const { selectedUsers, subject, content } = req.body;
    
    if (!selectedUsers || !selectedUsers.length) {
        const status = encodeURIComponent(JSON.stringify({ type: 'error', message: 'No users selected.' }));
        return res.redirect(`/admin?admin=true&status=${status}`);
    }

    try {
        const recipients = Array.isArray(selectedUsers) ? selectedUsers : [selectedUsers];
        
        // Render the sleek newsletter template
        const mailContent = await renderTemplate("newsletterMail.ejs", {
            subject,
            content
        });

        // Loop through recipients to send email (for better delivery tracking per person)
        // In production, consider using BCC for smaller lists or a queue system for large lists
        const sendPromises = recipients.map(email => {
            return transporter.sendMail({
                from: process.env.APP_MAIL,
                to: email,
                subject: subject,
                html: mailContent,
                // Attachments or header image if needed
            });
        });

        await Promise.all(sendPromises);

        const status = encodeURIComponent(JSON.stringify({ 
            type: 'success', 
            message: `Newsletter sent successfully to ${recipients.length} members!` 
        }));
        res.redirect(`/admin?admin=true&status=${status}`);

    } catch (error) {
        console.error("Bulk send error:", error);
        const status = encodeURIComponent(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to send newsletter. Please check server logs.' 
        }));
        res.redirect(`/admin?admin=true&status=${status}`);
    }
};

/**
 * Render the admin login page.
 */
const getLoginPage = (req, res) => {
    res.render("AdminLogin", { message: null });
};

/**
 * Handle admin login request.
 */
const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "rccg-admin-2026";
    
    try {
        const user = await UserModel.findOne({ 
            email: email.trim().toLowerCase(),
            role: 'admin'
        });

        // Check against both individual password and the global default password
        const isPasswordValid = (user && user.password === password) || (user && password === defaultAdminPassword);

        if (isPasswordValid) {
            req.session.adminId = user._id;
            res.redirect("/admin");
        } else {
            res.render("AdminLogin", { 
                message: "Invalid admin credentials. Please try again." 
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.render("AdminLogin", { message: "An error occurred during login." });
    }
};

/**
 * Handle admin logout request.
 */
const handleLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Logout error:", err);
        res.redirect("/admin/login");
    });
};

module.exports = {
    getAdminDashboard,
    sendBulkNewsletter,
    getLoginPage,
    handleLogin,
    handleLogout
};
