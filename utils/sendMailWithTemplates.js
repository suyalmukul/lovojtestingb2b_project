const nodemailer = require('nodemailer');
const { loadTemplate } = require('../public/templates/loadTemplate');

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

// Nodemailer function to send emails
exports.mailwithTemplate = async(to, subject, templateName, type, replacements) => {
  let variables = {};
  if (type === "Order-Success") {
    let name = replacements.name;
    let order_number = replacements.order_number;
    variables = {
      header: "Order-Success",
      message: `<p>Hello <span>${name}</span>,</p><br /><p>Thank you for your order. We appreciate your business and will be thrilled to send your products in <strong>Order: ${order_number}</strong> as soon as possible. An email with tracking information will be sent to you once your order has shipped.</p>`,
    };
  }
  const html = loadTemplate(templateName, variables);

  const mailOptions = {
    to,
    subject,
    html,
  };

   transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    return true;
  });
};

