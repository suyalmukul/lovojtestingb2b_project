const nodemailer = require("nodemailer");
const fs = require("fs");

exports.sendingEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USERNAMEE,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USERNAMEE,
      to,
      subject,
      text,
    });

    return true; // Email sent successfully
  } catch (error) {
    console.error("Failed to send email:", error);
    return false; // Email sending failed
  }
};


exports.billEmail = async (to, subject, text, pdfFilePath) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USERNAMEE,
        pass: process.env.PASS,
      },
    });

    // Read the PDF file
    const pdfAttachment = fs.readFileSync(pdfFilePath);

    await transporter.sendMail({
      from: process.env.USERNAMEE,
      to,
      subject,
      text,
      attachments: [
        {
          filename: "bill_invoice.pdf",
          content: pdfAttachment,
          encoding: "base64", // Use base64 encoding for binary data (like PDFs)
        },
      ],
    });

    return true; // Email sent successfully
  } catch (error) {
    console.error("Failed to send email:", error);
    return false; // Email sending failed
  }
};
