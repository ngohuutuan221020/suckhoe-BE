import db from "../models/index";
import _ from "lodash";

let createClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.name || !data.address || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing parameter",
        });
      } else {
        await db.Clinic.create({
          name: data.name,
          address: data.address,
          image: data.imageBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });
        resolve({
          errorCode: 0,
          errorMessage: "Create successfully",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllClinic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Clinic.findAll({
        order: [["id", "DESC"]],
      });
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errorCode: 0,
        errorMessage: "getAllClinic successfully",
        data,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailClinicById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing parameter",
        });
      } else {
        let data = await db.Clinic.findOne({
          where: {
            id: inputId,
          },
          attributes: ["name", "address", "descriptionHTML", "descriptionMarkdown"],
        });
        if (data) {
          let doctorClinic = [];

          doctorClinic = await db.Doctor_Infor.findAll({
            where: {
              clinicId: inputId,
            },
            include: [
              {
                model: db.Specialty,
              },
            ],
            raw: true,
            nest: true,
          });
          data.doctorClinic = doctorClinic;
        } else data = {};
        resolve({
          errorCode: 0,
          errorMessage: "Successfully",
          data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  createClinic: createClinic,
  getAllClinic: getAllClinic,
  getDetailClinicById: getDetailClinicById,
};
