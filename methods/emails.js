"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "write the sender's email",
    pass: "write the sender's password",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendMails(email, message, ToReset, token) {
  console.log("sendMails mail");
  console.log(email);
  //message for verification a user account
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "amankhare900@gmail.com", // sender address
    to: email, // list of receivers
    subject: `One Last Step To ${message}✔`, // Subject line
    text: "successfully", // plain text body
    html: `
    <div style="background-color: #f5f5f5; padding: 20px;">
    <div style="background-color: white; padding: 20px; border-radius: 10px;">
    <h1 style="text-align: center; color: #111111;">${message}</h1>
    <p style="text-align: center; color: #111111;">Click the button below to ${message}</p>
    <div style="text-align: center;">
    ${
      ToReset === 1
        ? `<h3 style="text-align: center; color: #111111;">${token}</h3>`
        : ""
    }
    <a href="http://localhost:3000/verify?email=${email}&toReset=${ToReset}&token=${token}" style="background-color: #71fe64; padding: 10px; border-radius: 10px; color: white; text-decoration: none;">${message}</a>
    </div>
    </div>
    `,
  });
  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}

module.exports = sendMails;

// main().catch(console.error);
