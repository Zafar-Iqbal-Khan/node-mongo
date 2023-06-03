const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { print } = require("../common/common");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

// [CREATE NEW ORDER]
exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({ success: true, message: "Successful", order });
});

// [GET SINGLE ORDER]
exports.singleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(ErrorHandler("Order not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// [GET LOGGED IN USER ORDERS]
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// [GET ALL ORDERS]
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalAmount;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// [UPDATE ORDER STATUS -- ADMIN]
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.find(req.params.id);
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 404));
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// [DELETE ORDER --ADMIN]
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.find(req.query.id);
  if (!order) {
    return next(ErrorHandler("Order not found with this id", 404));
  }

  await order.remove();
  res.status(200).json({
    success: true,
  });
});
