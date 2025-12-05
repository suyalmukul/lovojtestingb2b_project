const nodemailer = require("nodemailer");
const fs = require("fs");
var handlebars = require("handlebars");
module.exports = async (
  email,
  subject,
  res,
  templates,
  replacements,
  meeting,
  id,
  attachmentToSend
) => {
  try {
    console.log(
      "sssss",
      subject,
      process.env.USERNAMEE,
      process.env.PASS,
      process.env.EMAIL_PORT,
      process.env.SECURE
    );
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

    const readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          callback(err);
        } else {
          callback(null, html);
        }
      });
    };

    readHTMLFile(
      `./public/templates/${templates}.html`,
      async function (err, html) {
        var template = handlebars.compile(html);
        //   var replacements = {
        //     username: "ghous ahmed",
        //     locationDescription: "test",
        //   };
        var htmlToSend = template(replacements);
        let subjectss = subject == "Feedback" ? subject : "no";

        await transporter.sendMail({
          from: process.env.USERNAMEE,
          to: email,
          subject: subject,
          html: htmlToSend,
          attachments: attachmentToSend,
        });

        if (subject == "Store Created") {
          return res.status(200).send({
            status: 200,
            message: `Otp sent Successfully.`,
          });
        } else if (subject == "Meeting") {
          res.status(200).send({ message: "meeting Created", meeting });
        } else if (subject == "Meeting Updated") {
          res.status(200).send({ message: "meeting Updated" });
        } else if (subject == "USER REJECTED") {
          res
            .status(200)
            .send({ message: "User rejected!", userId: replacements?.userId });
        } else if (subject == "Business REJECTED") {
          res.status(200).send({ message: "User rejected!" });
        } else if (subject == "Feedback") {
          return res.status(200).send({ message: "FeedBack Recieved" });
        } else if (subject == "Interviewed") {
          return res
            .status(200)
            .send({ message: "you have added to interview to this user." });
        } else if (subject == "Hired") {
          return res.status(200).send({ message: "you have Hired this user." });
        } else if (subject == "Applied") {
          return res.status(200).send({ message: "job applied successfully" });
        } else if (subject == "Withdrawn") {
          return res.status(200).send({ message: "Job withdrawn" });
        } else if (subject == "Shortlisted") {
          return res
            .status(200)
            .send({ message: "you have Shortlisted this user." });
        } else if (subject == "Closed") {
          return res.status(200).send({ message: "you have Closed this Job." });
        } else if (subject == "Rejected") {
          return res
            .status(200)
            .send({ message: "you have Rejected this user." });
        } else if (subject == "Job Approved") {
          return res.status(200).send({ message: "job approved!" });
        } else if (subject == "User approved") {
          return res.status(200).send({ message: "User approved!" });
        } else if (subject == "job Created") {
          return res.status(200).send({
            message: "Job added successfully to the database.",
            job: replacements.job,
          });
        } else if (subject == "package Paid") {
          return;
        } else if (subject == "Invoice Paid") {
          return;
        } else if (subject == "job Paid") {
          return;
        } else if (subject == "pending again") {
          return;
        } else if (subject == "job completed") {
          return;
        } else if (subject == "Invoice") {
          // go on
        } else if (subject == "User Strike Status") {
          return res
            .status(200)
            .send({ message: `User has been ${replacements.action}` });
        } else if (subject == "User Striked") {
          return res
            .status(200)
            .send({ message: `User got  ${replacements.strikeNumber} strike` });
        } else if (subject == "recruiter Created") {
          return res.status(200).send({
            message: "Signup Successfull and Company Created",
            token: meeting,
            user: replacements?.user,
            company: replacements?.company,
          });
        } else {
          return res.status(200).send({ success : true , message: `Your verification code has been sent to your email address and mobile number.` });
        }
      }
    );
  } catch (error) {
    res.status(404).send({ message: error });
  }
};
