const Product = require("../models/productModel");
const { print } = require("../common/common");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

// [CREATE PRODUCT -- ADMIN]
/**
 * @swagger
 * tags:
 *   - name: products
 *     description: Product management
 * /api/v1/create-new-product:
 *   post:
 *     summary: Create a new product
 *     operationId: createProduct
 *     tags:
 *       - products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Product"
 *     responses:
 *       "201":
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       "400":
 *         description: Invalid request
 *
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stock
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the product.
 *           example: "Example Product"
 *         description:
 *           type: string
 *           description: A brief description of the product.
 *           example: "This is an example product"
 *         price:
 *           type: number
 *           description: The price of the product.
 *           example: 9.99
 *         ratings:
 *           type: number
 *           description: The average rating of the product.
 *           example: 4
 *         images:
 *           type: array
 *           description: An array of images associated with the product.
 *           items:
 *             type: object
 *             properties:
 *               public_id:
 *                 type: string
 *                 description: The public ID of the image.
 *                 example: "example_public_id"
 *               url:
 *                 type: string
 *                 description: The URL of the image.
 *                 example: "https://example.com/image.jpg"
 *         category:
 *           type: string
 *           description: The category of the product.
 *           example: "example_category"
 *         stock:
 *           type: number
 *           description: The stock quantity of the product.
 *           example: 100
 *         numOfReviews:
 *           type: number
 *           description: The number of reviews for the product.
 *           example: 5
 *         reviews:
 *           type: array
 *           description: An array of reviews for the product.
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the reviewer.
 *                 example: "John Doe"
 *               rating:
 *                 type: number
 *                 description: The rating given by the reviewer.
 *                 example: 4
 *               comment:
 *                 type: string
 *                 description: The comment made by the reviewer.
 *                 example: "This is a great product!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the product was created.
 *           example: "2023-05-04T12:34:56Z"
 */
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res
    .status(200)
    .json({ success: true, message: "Successful", product: product });
});

//[GET PRODUCTS]
/**
 * @swagger
 *  tags:
 *   - name: products
 *     description: Product management
 * /api/v1/get-all-products:
 *   get:
 *     summary: Returns a hello message
 *     responses:
 *       200:
 *         description: A hello message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeature.query;
  return res.status(200).json({
    success: true,
    message: "Successful",
    productCount,
    product: products,
  });
});

// [UPDATE PRODUCT -- ADMIN]
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({
    success: true,
    message: "product updated successfully",
    product,
  });
});

// [DELETE PRODUCT -- ADMIN]
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  product = await Product.findByIdAndDelete(req.params.id);
  return res.status(200).json({
    success: true,
    message: "product deleted successfully",
  });
});

//[GET SINGLE PRODUCT DETAILS]
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  return res
    .status(200)
    .json({ success: true, message: "Product found successfully", product });
});

// [CREATE NEW REVIEW OR UPDATE THE REVIEW]
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// [GET ALL REVIEWS OF A SINGLE PRODUCT]
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ success: true, reviews: product.reviews });
});

// [DELETE A REVIEW]
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({ success: true });
});

//[ORDER API]
exports.order = catchAsyncError(async (req, res, next) => {});
