const { print } = require("../common/common");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// [REGISTER A USER]
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  //[INSERTING INTO DB]
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      url: "profile_pic_url",
    },
  });
  sendToken(user, 201, res);
});

// [LOGIN USER]
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // [CHECKING IF USER HAS GIVEN EMAIL AND PASSWORD]
  if (!email && !password) {
    return next(new ErrorHandler("Please Enter Email And Password", 400));
  }

  //[SEARCHING USER]
  const user = await User.findOne({
    email,
  }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password", 401));
  }

  //[COMPARE PASSWORD]
  const isPasswordMatch = await user.comparePassword(password);
  print(isPasswordMatch);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password", 401));
  }

  sendToken(user, 200, res);
});

//[LOGOUT USER]
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out" });
});

// [FORGOT PASSWORD]
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  // [GET RESET PASSWORD TOKEN]
  const resetToken = user.getPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :-\n\n${resetPasswordUrl}\n\n if you have not requested this email, then please ignore it `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// [RESET PASSWORD]

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // [CREATING HASHED TOKEN]

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetExpireTime: { $gt: Date.Now },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match ", 400));
  }
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  sendToken(user, 200, res);
});

// [GET USER DETAILS]
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user });
});

// [UPDATE PASSWORD]

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);
  print(isPasswordMatch);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// [UPDATE USER PROFILE]
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
  };

  // [WE WILL ADD IMAGE AVATAR LATER]

  const user = await User.findByIdAndUpdate(req.user.id, userData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({ success: true, user });
});

// [GET ALL USERS------FOR ADMIN]
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, users });
});

// [GET SINGLE USER------FOR ADMIN]
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not Exist with id=${req.params.id}`, 400)
    );
  }

  res.status(200).json({ success: true, user });
});

// [UPDATE USER ROLE]
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({ success: true, user });
});

// [DELETE USER]
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not Exist with id=${req.params.id}`, 400)
    );
  }
  await user.remove();

  res.status(200).json({ success: true, message: "user deleted successfully" });
});
