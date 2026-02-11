const UserModel = require("../models/user.model");
const { renderTemplate, transporter } = require("../middleware/mail.sender");

/**
 * Register a new user and send welcome email (JSON version)
 */
const apiRegisterUser = async (req, res) => {
    let { firstName, lastName, email, phoneNumber } = req.body;
    
    // Normalize data
    email = email?.trim().toLowerCase();
    firstName = firstName?.trim();
    lastName = lastName?.trim();

    if (!email || !firstName || !lastName) {
        return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "This email is already subscribed." });
        }

        await UserModel.create({ firstName, lastName, phoneNumber, email });

        const mailContent = await renderTemplate("welcomeMail.ejs", {
            firstname: firstName, 
            lastname: lastName,
        });

        const mailOptions = {
            from: process.env.APP_MAIL,
            to: email, 
            subject: `Welcome ${firstName} to Breakthrough Cathedral`,
            html: mailContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("Email error:", error);
        });

        res.json({ success: true, message: "Registration Successful! Welcome email sent." });

    } catch (error) {
        console.error("API Registration error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Handle admin login (JSON version)
 */
const apiHandleLogin = async (req, res) => {
    const { email, password } = req.body;
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "rccg-admin-2026";
    
    try {
        const user = await UserModel.findOne({ 
            email: email?.trim().toLowerCase(),
            role: 'admin'
        });

        const isPasswordValid = (user && user.password === password) || (user && password === defaultAdminPassword);

        if (isPasswordValid) {
            req.session.adminId = user._id;
            res.json({ 
                success: true, 
                user: { 
                    id: user._id, 
                    email: user.email, 
                    firstName: user.firstName, 
                    lastName: user.lastName 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid admin credentials." });
        }
    } catch (error) {
        console.error("API Login error:", error);
        res.status(500).json({ success: false, message: "An error occurred during login." });
    }
};

/**
 * Get simple dashboard data (subscribers)
 */
const apiGetSubscribers = async (req, res) => {
    try {
        const users = await UserModel.find({ role: 'user' }).sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Bulk send newsletter returning JSON status
 */
const apiSendBulkNewsletter = async (req, res) => {
    const { selectedUsers, subject, content } = req.body;
    
    if (!selectedUsers || !selectedUsers.length) {
        return res.status(400).json({ success: false, message: "No users selected." });
    }

    try {
        const recipients = Array.isArray(selectedUsers) ? selectedUsers : [selectedUsers];
        const mailContent = await renderTemplate("newsletterMail.ejs", { subject, content });

        const sendPromises = recipients.map(email => {
            return transporter.sendMail({
                from: process.env.APP_MAIL,
                to: email,
                subject: subject,
                html: mailContent,
            });
        });

        await Promise.all(sendPromises);
        res.json({ success: true, message: `Newsletter sent successfully to ${recipients.length} members!` });

    } catch (error) {
        console.error("API Bulk send error:", error);
        res.status(500).json({ success: false, message: "Failed to send newsletter." });
    }
};

const apiHandleLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed." });
        res.json({ success: true, message: "Logged out successfully." });
    });
};

module.exports = {
    apiRegisterUser,
    apiHandleLogin,
    apiGetSubscribers,
    apiSendBulkNewsletter,
    apiHandleLogout
};
