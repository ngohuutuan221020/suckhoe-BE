import doctorService from "../services/doctorService";

let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 20;
  try {
    let response = await doctorService.getTopDoctorHome(+limit);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json({
      errorCode: -1,
      message: "error from serverss",
    });
  }
};
let getAllDoctors = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctors();
    return res.status(200).json(doctors);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from server Get all doctor",
    });
  }
};
let postInforDoctors = async (req, res) => {
  try {
    let response = await doctorService.saveDetailInforDoctors(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from server Get all doctor",
    });
  }
};
let getDetailDoctorById = async (req, res) => {
  try {
    let response = await doctorService.getDetailDoctorById(req.query.id);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from server Get detail doctor",
    });
  }
};
let bulkSreateSchedule = async (req, res) => {
  try {
    let response = await doctorService.bulkSreateScheduleServer(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from bulkSreateScheduleServer",
    });
  }
};
let getScheduleByDate = async (req, res) => {
  try {
    let infor = await doctorService.getScheduleByDate(req.query.doctorId, req.query.date);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from /api/get-schedule-doctor-by-date",
    });
  }
};
let getDoctorExtraInforById = async (req, res) => {
  try {
    let infor = await doctorService.getDoctorExtraInforById(req.query.doctorId);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from /api/get-schedule-doctor-by-date",
    });
  }
};
let getProfileDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getProfileDoctorById(req.query.doctorId);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from /api/get-schedule-doctor-by-date",
    });
  }
};
let getListPatientForDoctor = async (req, res) => {
  try {
    let infor = await doctorService.getListPatientForDoctor(req.query.doctorId, req.query.date);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error getListPatientForDoctor",
    });
  }
};
let getListPatient = async (req, res) => {
  try {
    let infor = await doctorService.getListPatient(req.query.date);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error getListPatient",
    });
  }
};
let sendRemedy = async (req, res) => {
  try {
    let infor = await doctorService.sendRemedy(req.body);
    return res.status(200).json(infor);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error sendRemedy",
    });
  }
};
module.exports = {
  sendRemedy: sendRemedy,
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  postInforDoctors: postInforDoctors,
  getDetailDoctorById: getDetailDoctorById,
  bulkSreateSchedule: bulkSreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getDoctorExtraInforById: getDoctorExtraInforById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  getListPatient: getListPatient,
};
