import patientService from "../services/patientService";
let postBookAppointment = async (req, res) => {
  try {
    let response = await patientService.postBookAppointment(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      // errorCode: -1,
      // message: "error from postBookAppointment",
    });
  }
};
let postVerifyAppointment = async (req, res) => {
  try {
    let response = await patientService.postVerifyAppointment(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from postVerifyAppointment",
    });
  }
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyAppointment: postVerifyAppointment,
};
