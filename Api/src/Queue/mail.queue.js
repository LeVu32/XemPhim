import Queue from "bull";
import nodemailer from "nodemailer";

const mailQueue = new Queue("mails", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

mailQueue.process(async (job, done) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp@gmail.com",
    auth: {
      user: "dahashophihi@gmail.com",
      pass: "dkbfvgyxnhnzwnlo",
    },
  });

  let mailOptions = {
    from: "dahashophihi@gmail.com",
    to: job.data.to,
    subject: job.data.subject,
    html: job.data.html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      done(new Error("Mail failed"));
    } else {
      done(null, "Mail sent");
    }
  });
});

export default mailQueue;
