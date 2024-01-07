import {raw} from "body-parser";
import emailService from "../services/emailService";
import db from "../models/index";
import _ from "lodash";
require("dotenv").config();
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: {roleId: "R2"},
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errorCode: 0,
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: {roleId: "R2"},
        attributes: {
          exclude: ["password", "image"],
        },
      });
      resolve({
        errorCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let checkArr = (inputData) => {
  let arr = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvince",
    "nameClinic",
    "addressClinic",
    "note",
    "specialtyId",
  ];
  let isValid = true;
  let element = "";
  for (let i = 0; i < arr.length; i++) {
    if (!inputData[arr[i]]) {
      isValid = false;
      element = arr[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};
let saveDetailInforDoctors = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkArr(inputData);
      if (checkObj.isValid === false) {
        resolve({
          errorCode: 1,
          errorMessage: `Miss: ${checkObj.element}`,
        });
      } else {
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: {doctorId: inputData.doctorId},
            raw: false,
          });
          if (doctorMarkdown) {
            (doctorMarkdown.contentHTML = inputData.contentHTML),
              (doctorMarkdown.contentMarkdown = inputData.contentMarkdown),
              (doctorMarkdown.description = inputData.description),
              await doctorMarkdown.save();
          }
        }

        //upsert to doctor infor
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: inputData.doctorId,
          },
          raw: false,
        });
        if (doctorInfor) {
          //update
          doctorInfor.doctorId = inputData.doctorId;
          doctorInfor.priceId = inputData.selectedPrice;
          doctorInfor.paymentId = inputData.selectedPayment;
          doctorInfor.provinceId = inputData.selectedProvince;

          doctorInfor.nameClinic = inputData.nameClinic;
          doctorInfor.addressClinic = inputData.addressClinic;
          doctorInfor.note = inputData.note;
          doctorInfor.specialtyId = inputData.specialtyId;
          doctorInfor.clinicId = inputData.clinicId;

          await doctorInfor.save();
        } else {
          //create a new
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceId: inputData.selectedPrice,
            paymentId: inputData.selectedPayment,
            provinceId: inputData.selectedProvince,

            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,

            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId,
          });
        }
        resolve({
          errorCode: 0,
          errorMessage: "Save infor Successfully",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        let data = await db.User.findOne({
          where: {id: inputId},
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["contentHTML", "contentMarkdown", "description"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({
          errorCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let bulkSreateScheduleServer = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            item.currentNumber = 0;
            return item;
          });
        }
        let extsting = await db.Schedule.findAll({
          where: {doctorId: data.doctorId, date: data.formattedDate},
          attributes: ["timeType", "date", "doctorId", "maxNumber"],
          raw: true,
        });
        // if (extsting && extsting.length > 0) {
        //   extsting = extsting.map((item) => {
        //     item.date = new Date(item.date).getTime();
        //     return item;
        //   });
        // }
        let toCreate = _.differenceWith(schedule, extsting, (a, b) => {
          return a.timeType === b.timeType && a.date === b.date;
        });
        console.log("date1", schedule);
        console.log("date2", extsting);
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }
        resolve({
          errorCode: 0,
          errorMessage: "OK",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!dataSchedule) dataSchedule = [];
        resolve({
          errorCode: 0,
          data: dataSchedule,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getDoctorExtraInforById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: {
            doctorId: doctorId,
          },
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) data = {};
        resolve({
          errorCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getProfileDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: doctorId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["contentHTML", "contentMarkdown", "description"],
            },
            {model: db.Allcode, as: "positionData", attributes: ["valueEn", "valueVi"]},
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {model: db.Allcode, as: "priceTypeData", attributes: ["valueEn", "valueVi"]},
                {model: db.Allcode, as: "paymentTypeData", attributes: ["valueEn", "valueVi"]},
                {model: db.Allcode, as: "provinceTypeData", attributes: ["valueEn", "valueVi"]},
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({
          errorCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: "S2",
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: ["email", "firstName", "gender", "phoneNumber", "address", "reason"],
              include: [{model: db.Allcode, as: "genderData", attributes: ["valueEn", "valueVi"]}],
            },
            {model: db.Allcode, as: "timeTypeDataPatient", attributes: ["valueEn", "valueVi"]},
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errorCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter",
        });
      } else {
        //update
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: "S2",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S3";
          await appointment.save();
        }
        //send
        await emailService.sendAttachment(data);
        resolve({
          errorCode: 0,
          errorMessage: "ok",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  sendRemedy: sendRemedy,
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctors: saveDetailInforDoctors,
  getDetailDoctorById: getDetailDoctorById,
  bulkSreateScheduleServer: bulkSreateScheduleServer,
  getScheduleByDate: getScheduleByDate,
  getDoctorExtraInforById: getDoctorExtraInforById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
};