import db from "../models/index";
import _ from "lodash";
require("dotenv").config();
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
import emaiService from "./emailService";

import {v4 as uuidv4} from "uuid";

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let schedule = await db.Schedule.findOne({
        where: {
          doctorId: data.doctorId,
          timeType: data.timeType,
          date: data.dateString,
        },
        raw: false,
      });
      if (schedule.currentNumber === schedule.maxNumber) {
        resolve({
          errorCode: 5,
          message: "Lich da day",
        });
      } else {
        if (
          !data.email ||
          !data.doctorId ||
          !data.timeType ||
          !data.date ||
          !data.fullName ||
          !data.phoneNumber ||
          !data.selectedGenders ||
          !data.address ||
          !data.reason
        ) {
          resolve({
            errorCode: 1,
            errorMessage: "Missing required parameter",
          });
        } else {
          let token = uuidv4();
          //email
          await emaiService.sendSimpleEmail({
            reciverEmail: data.email,
            patientName: data.fullName,
            time: data.timeString,
            doctorName: data.doctorName,
            language: data.language,
            // price: "500.000VND",
            redirecLink: buildUrlEmail(data.doctorId, token),
          });

          await db.User.findOrCreate({
            where: {email: data.email},
            defaults: {
              email: data.email,
              roleId: "R3",
              firstName: data.fullName,
              phoneNumber: data.phoneNumber,
              gender: data.selectedGenders,
              address: data.address,
              reason: data.reason,
            },
          }).then(async (user, created) => {
            await db.Booking.create({
              statusId: "S1",
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
            });
            // if (user && user[0]) {
            //   await db.Booking.findOrCreate({
            //     where: {
            //       statusId: "S1",
            //     },
            //     defaults: {
            //       statusId: "S1",
            //       doctorId: data.doctorId,
            //       patientId: user[0].id,
            //       date: data.date,
            //       timeType: data.timeType,
            //       token: token,
            //     },
            //   });
            // }
            if (!created) {
              let user = await db.User.findOne({
                where: {email: data.email},
                raw: false,
              });
              if (user) {
                user.firstName = data.fullName;
                user.address = data.address;
                user.phoneNumber = data.phoneNumber;
                user.gender = data.selectedGenders;
                user.reason = data.reason;
                await user.save();
                // resolve({
                //   errorCode: 0,
                //   message: "Update successful",
                // });
              } else {
                resolve({
                  errorCode: 1,
                  message: "User not found",
                });
              }
            }
          });

          // let schedule = await db.Schedule.findOne({
          //   where: {
          //     doctorId: data.doctorId,
          //     timeType: data.timeType,
          //   },
          //   raw: false,
          // });
          // if (schedule.currentNumber === schedule.maxNumber) {
          //   resolve({
          //     errorCode: 1,
          //     message: "Lich da day",
          //   });
          // } else {
          if (schedule) {
            schedule.currentNumber = ++schedule.currentNumber;
            await schedule.save();
            resolve({
              errorCode: 0,
              message: "Update successful",
            });
          } else {
            resolve({
              errorCode: 1,
              message: "User not found",
            });
          }
          resolve({
            errorCode: 0,
            errorMessage: "send success",
          });
          // }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let postVerifyAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing token",
        });
      } else {
        let appoiment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });
        if (appoiment) {
          appoiment.statusId = "S2";
          await appoiment.save();

          resolve({
            errorCode: 0,
            errorMessage: "Update the appoiment successfully",
          });
        } else {
          resolve({
            errorCode: 2,
            errorMessage: "Lich hen da duoc kich hoat hoac khong ton tai.",
          });
        }

        //currenNumner
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyAppointment: postVerifyAppointment,
};
