const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateUserProfile,
  getAllUsers,
  getSingleUser,
  deleteUser,
} = require("../controllers/userController");
const { isUserAuthenticated, authorizeRole } = require("../middleware/auth");

const router = express.Router();

router.route("/register-user").post(registerUser);
router.route("/login-user").post(loginUser);
router.route("/logout-user").get(logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").put(resetPassword);
router.route("/get-user-details").get(isUserAuthenticated, getUserDetails);
router.route("/update-password").put(isUserAuthenticated, updatePassword);
router
  .route("/update-user-profile")
  .put(isUserAuthenticated, updateUserProfile);

router
  .route("/admin/get-all-users")
  .get(isUserAuthenticated, authorizeRole("admin"), getAllUsers);
router
  .route("/admin/get-single-user/:id")
  .get(isUserAuthenticated, authorizeRole("admin"), getSingleUser);
router
  .route("/update-user-role/:id")
  .put(isUserAuthenticated, authorizeRole("admin"), updateUserProfile);

router
  .route("/delete-user/:id")
  .put(isUserAuthenticated, authorizeRole("admin"), deleteUser);

module.exports = router;
