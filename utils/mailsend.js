const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");

module.exports = async (
  email,
  subject,
  res,
  templates,
  replacements,
  attachmentToSend
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USERNAMEE,
        pass: process.env.PASSWORDD,
      },
    });

    const html = await getHTMLFromTemplate(templates, replacements);

    const mailOptions = {
      from: process.env.USERNAMEE,
      to: email,
      subject: subject,
      html: html,
      attachments: attachmentToSend,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

const getHTMLFromTemplate = async (template, replacements) => {
  try {
    const filePath = `./email-templates/${template}.handlebars`;
    const fileExists = await fs.promises
      .access(filePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      console.error(`Template file "${filePath}" not found`);
      return "";
    }

    const templateFile = await fs.promises.readFile(filePath, {
      encoding: "utf-8",
    });

    const handlebarsTemplate = handlebars.compile(templateFile);
    const htmlToSend = handlebarsTemplate(replacements);
    return htmlToSend;
  } catch (error) {
    console.error("Error getting HTML from template: ", error);
    return "";
  }
};
