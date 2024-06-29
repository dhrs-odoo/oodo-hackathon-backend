import nodemailer from "nodemailer";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import ejs from "ejs";
import { CustomerModel } from "../../database/models/index.js";
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

async function sendCustomerWelcomeEmail(customerEmail) {
  const subject = "Welcome to rentify";
  const text = "WELCOME!";

  try {
    const customer = await CustomerModel.findOne({
      email: customerEmail,
    });
    console.log("customer Data:", customer);
    if (!customer) {
      throw new Error("customer not found");
    }

    const html = ejs.render(
      fs.readFileSync(
        path.join(__dirname, "mailTemplates", "customerWelcome.ejs"),
        "utf8"
      ),
      {
        data: { firstName: customer.fullName },
      }
    );

    const response = await sendEmail(customerEmail, subject, text, html);
    console.log("Welcome Email sent:", response);
  } catch (error) {
    console.error(error);
    throw new Error("Welcome Email could not be sent");
  }
}
async function sendCustomerVerificationMail(customerEmail, link) {
  const subject = "Verification Link";
  const text = "Please verify your self!";

  try {
    const customer = await CustomerModel.findOne({
      email: customerEmail,
    });
    console.log("customer Data:", customer);
    if (!customer) {
      throw new Error("customer not found");
    }

    const html = ejs.render(
      fs.readFileSync(
        path.join(
          __dirname,
          "mailTemplates",
          "customerVerificationLinkTemplate.ejs"
        ),
        "utf8"
      ),
      {
        data: { Link: link, Name: customer.firstName },
      }
    );

    const response = await sendEmail(customerEmail, subject, text, html);
    console.log("Verification Email sent:", response);
  } catch (error) {
    console.error(error);
    throw new Error("Verification Email could not be sent");
  }
}
async function sendCustomerForgotPasswordLink(customerEmail, link) {
  const subject = "Forgot Password";
  const text = "You Can Now Forgot Your Password";

  try {
    const customer = await CustomerModel.findOne({
      email: customerEmail,
    });
    console.log("customer Data:", customer);
    if (!customer) {
      throw new Error("customer not found");
    }

    const html = ejs.render(
      fs.readFileSync(
        path.join(__dirname, "mailTemplates", "customerForgotPass.ejs"),
        "utf8"
      ),
      {
        data: { Link: link, Name: customer.firstName },
      }
    );

    const response = await sendEmail(customerEmail, subject, text, html);
    console.log("Verification Email sent:", response);
  } catch (error) {
    console.error(error);
    throw new Error("Verification Email could not be sent");
  }
}

export {
  sendCustomerWelcomeEmail,
  sendCustomerVerificationMail,
  sendCustomerForgotPasswordLink,
};
