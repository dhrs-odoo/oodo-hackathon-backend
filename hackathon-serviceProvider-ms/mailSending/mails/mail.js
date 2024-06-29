import nodemailer from "nodemailer";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import ejs from "ejs";
import { ServiceProviderModel } from "../../database/models/index.js";
import { MAIL_APP_PASSWORD, MAIL_ID } from "../../config/index.js";

console.log("email id from the env is", MAIL_ID);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: MAIL_ID,
    pass: MAIL_APP_PASSWORD,
  },
});

function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: "info.rentiy12@gmail.com",
    to,
    subject,
    text,
    html,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        console.error("Mail options:", mailOptions);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info.response);
      }
    });
  });
}

async function sendServiceProviderWelcomeEmail(serviceProviderEmail) {
  const subject = "Welcome to rentiFy";
  const text = "WELCOME!";

  try {
    const serviceProvider = await ServiceProviderModel.findOne({
      email: serviceProviderEmail,
    });
    console.log("serviceProvider Data:", serviceProvider);
    if (!serviceProvider) {
      throw new Error("serviceProvider not found");
    }

    const html = ejs.render(
      fs.readFileSync(
        path.join(__dirname, "mailTemplates", "serviceProviderWelcome.ejs"),
        "utf8"
      ),
      {
        data: { firstName: serviceProvider.fullName },
      }
    );

    const response = await sendEmail(serviceProviderEmail, subject, text, html);
    console.log("Welcome Email sent:", response);
  } catch (error) {
    console.error(error);
    throw new Error("Welcome Email could not be sent");
  }
}

async function sendServiceProviderVerificationMail(serviceProviderEmail, link) {
  const subject = "Verification Link";
  const text = "Please verify your self!";

  try {
    const serviceProvider = await ServiceProviderModel.findOne({
      email: serviceProviderEmail,
    });
    console.log("serviceProvider Data:", serviceProvider);
    if (!serviceProvider) {
      throw new Error("serviceProvider not found");
    }

    const html = ejs.render(
      fs.readFileSync(
        path.join(
          __dirname,
          "mailTemplates",
          "serviceProviderVerificationLinkTemplate.ejs"
        ),
        "utf8"
      ),
      {
        data: { Link: link, Name: serviceProvider.firstName },
      }
    );

    const response = await sendEmail(serviceProviderEmail, subject, text, html);
    console.log("Verification Email sent:", response);
  } catch (error) {
    console.error(error);
    throw new Error("Verification Email could not be sent");
  }
}
async function sendServiceProviderForgotMail(serviceProviderEmail, link) {
  const subject = "Forgot Link";
  const text =
    "now you are able to forgot your password using below link it is valid for 1 hour.";

  try {
    const serviceProvider = await ServiceProviderModel.findOne({
      email: serviceProviderEmail,
    });
    console.log("serviceProvider Data:", serviceProvider);
    if (!serviceProvider) {
      throw new Error("serviceProvider not found");
    }

    const html = ejs.render(
      fs.readFileSync(
        path.join(__dirname, "mailTemplates", "serviceProviderForgotPass.ejs"),
        "utf8"
      ),
      {
        data: { Link: link, Name: serviceProvider.firstName },
      }
    );

    const response = await sendEmail(serviceProviderEmail, subject, text, html);
    console.log("forgot password  Email sent:", response);
  } catch (error) {
    console.error(error);
    throw new Error("forgot password  Email could not be sent");
  }
}
export {
  sendServiceProviderVerificationMail,
  sendServiceProviderWelcomeEmail,
  sendServiceProviderForgotMail,
};
