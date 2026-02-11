const express = require("express");
const router = express.Router();
const { 
    apiRegisterUser, 
    apiHandleLogin, 
    apiGetSubscribers, 
    apiSendBulkNewsletter,
    apiHandleLogout
} = require("../controllers/api.controller");
const { apiCheckAdmin } = require("../middleware/api.auth.middleware");

// Public endpoints
router.post("/register", apiRegisterUser);
router.post("/admin/login", apiHandleLogin);
router.get("/admin/logout", apiHandleLogout);

// Protected endpoints
router.get("/admin/dashboard", apiCheckAdmin, apiGetSubscribers);
router.post("/admin/send", apiCheckAdmin, apiSendBulkNewsletter);

module.exports = router;
