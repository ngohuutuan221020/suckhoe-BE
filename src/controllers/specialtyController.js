import specialtyService from "../services/specialtyService";

let createSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.createSpecialty(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from server",
    });
  }
};
let getAllSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.getAllSpecialty();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from server",
    });
  }
};
let getDetailSpecialtyById = async (req, res) => {
  try {
    let response = await specialtyService.getDetailSpecialtyById(req.query.id, req.query.location);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "error from server",
    });
  }
};
module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
};
