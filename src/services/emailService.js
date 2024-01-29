require("dotenv").config();
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Sức khoẻ" <ngohuutuan221020@gmail.com>', // sender address
    to: dataSend.reciverEmail, // list of receivers
    subject: "Thông tin đặt lịch khám bệnh", // Subject line
    // text: "Hello world?", // plain text body
    html: getBodyHTML(dataSend),
  });
};

let getBodyHTML = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3>Xin chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được Email này vì đã đặt lịch khám bệnh Online tại Phòng khám đa khoa Cà Mau</p>
    <p>Thông tin đặt lịch khám bệnh:</p>
    <div><b>Thời gian: ${dataSend.time}</b></div>
    <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

    <p>Vui lòng chọn vào đường dẫn bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
    <div><a href=${dataSend.redirecLink}>Hoàn tất thủ tục đặt lịch</a></div>
    
    <div>Xin chân thành cảm ơn!</div>
    `;
  }
  if (dataSend.language === "en") {
    result = `
    <h3>Dear ${dataSend.patientName}!</h3>
    <p>You received this Email because you have scheduled an Online medical examination at Ca Mau General Clinic</p>
    <p>Information on scheduling medical examinations:</p>
    <div><b>Time: ${dataSend.time}</b></div>
    <div><b>Doctor: ${dataSend.doctorName}</b></div>

    <p>Please select the link below to confirm and complete the medical appointment booking procedure.</p>
    <div><a href=${dataSend.redirecLink}>Complete the scheduling procedure</a></div>
    <div>Sincerely thank!</div>
    `;
  }
  return result;
};

//
let sendAttachment = async (dataSend) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Sức khoẻ" <ngohuutuan221020@gmail.com>', // sender address
    to: dataSend.email, // list of receivers
    subject: "Kết quả đặt lịch khám bệnh", // Subject line
    html: getBodyHTMLRemedy(dataSend),
    attachments: [
      {
        filename: `image-${dataSend.patientId}-${dataSend.patientName}.png`,
        content: dataSend.imgBase64.split("base64")[1],
        encoding: "base64",
      },
    ],
  });
};
let getBodyHTMLRemedy = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3>Xin chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được Email này vì đã khám bệnh Online tại Phòng khám đa khoa Cà Mau</p>
    <p>Thông tin đơn thuốc/hoá đơn được gửi trong tệp đính kèm: </p>
    
    <div>Xin chân thành cảm ơn!</div>
    `;
  }
  if (dataSend.language === "en") {
    result = `
    <h3>Dear ${dataSend.patientName}!</h3>
    <p>You received this Email because you have scheduled an Online medical examination at Ca Mau General Clinic</p>
  
    <div>Sincerely thank!</div>
    `;
  }
  return result;
};
module.exports = {
  sendSimpleEmail: sendSimpleEmail,
  sendAttachment: sendAttachment,
};
