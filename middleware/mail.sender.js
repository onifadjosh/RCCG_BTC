const ejs = require('ejs')
const path = require('path')
const nodemailer = require('nodemailer')
const dotenv= require('dotenv')
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.APP_MAIL,
        pass: process.env.APP_PASS
    }
});

const renderTemplate = async (templateName, data) => {
    try {
        const templatePath = path.join(__dirname, 'views', templateName);
        const html = await ejs.renderFile(templatePath, data);
        return html;
    } catch (error) {
        console.error('Error rendering template:', error);
        throw error;
    }
};

module.exports = {
    renderTemplate,
    transporter
}