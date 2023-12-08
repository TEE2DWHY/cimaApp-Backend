const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/asyncWrapper");
const Cattle = require("../../models/Cattle");
const cloudinary = require("../../utils/cloudinary");
const moment = require("moment");

// Register Cattle
const registerCattle = asyncWrapper(async (req, res) => {
  let result;
  const { id, name } = req.currentUser;
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please Upload Image.",
      });
    }
    const { vaccinationDate, dateOfTreatment } = req.body;
    const { path } = req.file;
    const parsedVaccineDate = moment(vaccinationDate, "DD-MM-YYYY");
    const parsedDateOfTreatment = moment(dateOfTreatment, "DD-MM-YYYY");
    if (!parsedVaccineDate.isValid() || !parsedDateOfTreatment.isValid()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid Date Format.",
      });
    }
    result = await cloudinary.uploader.upload(path);
    const cattle = await Cattle.create({
      ...req.body,
      registeredBy: id,
      image: result.secure_url,
      vaccinationDate: parsedVaccineDate,
      dateOfTreatment: parsedDateOfTreatment,
    });

    res.status(StatusCodes.CREATED).json({
      message: "New Cattle Profile Added.",
      cattle: cattle,
      // token: token,
      registrarName: name,
    });
  } catch (err) {
    if (result) {
      await cloudinary.uploader.destroy(result.public_id);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
    });
  }
});

// Get All Cattle
const allCattle = asyncWrapper(async (req, res) => {
  const cattle = await Cattle.find();
  res.status(StatusCodes.OK).json({
    message: {
      allCattle: cattle,
    },
  });
});

// Get A Specific Cattle
const getCattle = asyncWrapper(async (req, res) => {
  const { cattleId } = req.params;
  if (!cattleId) {
    return res.status(StatusCodes.OK).json({
      message: "Please Provide Cattle Id.",
    });
  }
  const cattle = await Cattle.findOne({ Id: cattleId });
  if (!cattle) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid Cattle Id",
    });
  }
  res.status(StatusCodes.OK).json({
    message: {
      cattle: cattle,
    },
  });
});

// Get Cattle Created By a Specific User
const allUserCattle = asyncWrapper(async (req, res) => {
  const { id } = req.currentUser;
  const allCattle = await Cattle.find({ registeredBy: id });
  return res.status(StatusCodes.OK).json({
    message: allCattle,
  });
});

// Update Cattle
const updateCattle = asyncWrapper(async (req, res) => {
  const { cattleId } = req.params;
  const data = { ...req.body };
  if (Object.keys(data).length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Data.",
    });
  }
  const updatedCattle = await Cattle.findOneAndUpdate(
    { Id: cattleId },
    { $set: data },
    { new: true }
  );
  res.status(StatusCodes.OK).json({
    message: updatedCattle,
  });
});

module.exports = {
  registerCattle,
  allCattle,
  getCattle,
  allUserCattle,
  updateCattle,
};
