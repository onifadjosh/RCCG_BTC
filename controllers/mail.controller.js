const UserModel = require("../models/user.model");
const { renderTemplate, transporter } = require("../middleware/mail.sender");

const registerUser = async (req, res) => {
  let { firstName, lastName, email, phoneNumber } = req.body;
  
  // Normalize data
  email = email.trim().toLowerCase();
  firstName = firstName.trim();
  lastName = lastName.trim();

  try {
    // Proactive check to prevent duplicates before processing
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.render("Register", {
        message: "This email is already subscribed to our newsletter.",
      });
    }

    // Create user in database
    await UserModel.create({
      firstName,
      lastName,
      phoneNumber,
      email,
    });

    // Render email template
    const mailContent = await renderTemplate("welcomeMail.ejs", {
      firstname: firstName, 
      lastname: lastName,
    });

    // Prepare mail options
    let mailOptions = {
      from: process.env.APP_MAIL,
      to: email, 
      subject: `Welcome ${firstName} to Breakthrough Cathedral`,
      html: mailContent,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Render success message
    res.render("Register", {
      message: "Registration Successful! Check your email for a welcome message.",
    });

  } catch (error) {
    console.log("Registration error:", error);

    if (error.code == 11000) {
      res.render("Register", {
        message: "This email is already subscribed to our newsletter.",
      });
    } else {
      res.render("Register", {
        message: "Failed to save user. Please try again.",
      });
    }
  }
};

module.exports = {
  registerUser
};
