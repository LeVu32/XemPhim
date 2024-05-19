import Queue from "bull";
import nodemailer from "nodemailer";

const mailQueue = new Queue("mails", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "dahashophihi@gmail.com",
    pass: "dkbfvgyxnhnzwnlo",
  },
});

mailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  let mailOptions = {
    from: "dahashophihi@gmail.com",
    to: to,
    subject: subject,
    html: html,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(result);
  // return result;
});

mailQueue.on("completed", (job, result) => {
  console.log(`Job completed with result: ${job.data.to}`);
  // Ở đây bạn có thể ghi vào cơ sở dữ liệu hoặc thực hiện các hành động khác
});

// Lắng nghe sự kiện khi công việc thất bại
mailQueue.on("failed", (job, err) => {
  console.log(`Job failed with error: ${err.message}`);
  // Ở đây bạn có thể ghi vào cơ sở dữ liệu hoặc thực hiện các hành động khác
});

export default mailQueue;
