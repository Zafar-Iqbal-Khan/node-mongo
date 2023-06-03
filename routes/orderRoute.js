const express = require("express");
const {
  newOrder,
  singleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { isUserAuthenticated, authorizeRole } = require("../middleware/auth");

const router = express.Router();

router.route("/new-order").post(isUserAuthenticated, newOrder);
router.route("/get-single-order/:id").get(isUserAuthenticated, singleOrder);
router.route("/my-orders").get(isUserAuthenticated, myOrders);
router
  .route("/admin/get-all-orders")
  .get(isUserAuthenticated, authorizeRole("admin"), getAllOrders);
router
  .route("admin/order/:id")
  .put(isUserAuthenticated, authorizeRole("admin"), updateOrder)
  .delete(isUserAuthenticated, authorizeRole("admin"), deleteOrder);

module.exports = router;
