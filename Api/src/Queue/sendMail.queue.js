import { mailQueue } from "./mail.queue";

const sendMail = (to, subject, html) => {
  mailQueue.add({
    to: to,
    subject: subject,
    html: html,
  });
};

module.exports = sendMail;
