"use strict";
import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // console.log('testAccount', testAccount.user);
    // console.log('testPass', testAccount.pass);

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        // port: 587,
        // secure: false, // true for 465, false for other ports
        service: "gmail",
        auth: {
            // user: "b4voi42yz7uzwid5@ethereal.email", // generated ethereal user
            // pass: "s8q5B169tzFucr9FFx", // generated ethereal password
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'theclubnz@gmail.com', // sender address
        to: to, // list of receivers
        subject: "Change password", // Subject line
        html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

