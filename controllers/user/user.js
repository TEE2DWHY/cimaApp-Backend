const User = require("../../models/User");
const asyncWrapper = require("../../middleware/asyncWrapper");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// Get all users
const allUsers = asyncWrapper(async (req, res) => {
  const users = await User.find();
  res.status(StatusCodes.OK).json({
    message: {
      allUsers: users.map((user) => {
        const { password, ...userData } = user.toObject();
        return userData;
      }),
    },
  });
});

// Get a Specific User
const getUser = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Token.",
    });
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { userId } = decodedToken;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid Token.",
    });
  }
  // const userData = user.toObject({ getters: true, versionKey: false });
  // delete userData.password;
  const { password, ...userData } = user.toObject();
  res.status(StatusCodes.OK).json({
    message: {
      user: userData,
    },
  });
});

// Update a User
const updateUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const data = { ...req.body };
  if (!userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide UserId.",
    });
  }
  if (Object.keys(data).length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Data.",
    });
  }
  const updatedUser = await User.findOneAndUpdate(
    { Id: userId },
    { $set: data },
    { new: true }
  );
  const { password, ...updatedUserData } = updatedUser;
  res.status(StatusCodes.OK).json({
    message: `User with Id: ${userId} is Successfully Updated.`,
    user: updatedUserData,
  });
});

// Delete a Specific User
const deleteUser = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Token.",
    });
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { userId, email } = decodedToken;
  const user = await User.findOneAndDelete({ _id: userId });
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid Token.",
    });
  }
  res.status(StatusCodes.OK).json({
    message: `Account for ${email} is Deleted.`,
  });
});

module.exports = { allUsers, getUser, updateUser, deleteUser };
