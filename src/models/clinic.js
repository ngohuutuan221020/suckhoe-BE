"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Clinic extends Model {
    static associate(models) {
      Clinic.hasMany(models.Doctor_Infor, {foreignKey: "clinicId"});
    }
  }
  Clinic.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      descriptionMarkdown: DataTypes.TEXT,
      descriptionHTML: DataTypes.TEXT,
      image: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Clinic",
    }
  );
  return Clinic;
};
