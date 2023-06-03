const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  deleteReview,
  getProductReviews,
} = require("../controllers/productController");
const { isUserAuthenticated, authorizeRole } = require("../middleware/auth");

const router = express.Router();

router
  .route("/admin/create-new-product")
  .post(isUserAuthenticated, authorizeRole("admin"), createProduct);
router.route("/get-all-products").get(getAllProducts);
router
  .route("/admin/update-product/:id")
  .put(isUserAuthenticated, authorizeRole("admin"), updateProduct);
router
  .route("/admin/delete-product/:id")
  .delete(isUserAuthenticated, authorizeRole("admin"), deleteProduct);
router.route("/get-product-details/:id").get(getProductDetails);
router.route("/review").put(isUserAuthenticated, createProductReview);
router.route("/delete-review").delete(isUserAuthenticated, deleteReview);
router
  .route("/get-product-reviews")
  .get( getProductReviews);
module.exports = router;

//[YOUTUBE 4:05:39]
