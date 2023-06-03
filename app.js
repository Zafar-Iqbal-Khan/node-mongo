const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const errorMiddleWare = require("./middleware/error");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// [SWAGGER]
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
  },

  servers: [
    {
      url: "/api/v1",
    },
  ],
  //[ Path to the API routes]
  apis: ["./controllers/productController.js"],
};

// [Initialize Swagger-jsdoc]
const swaggerSpec = swaggerJsdoc(options);
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");

//[ROUTE IMPORTS]
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

// [MIDDLEWARE FOR ERROR]
app.use(errorMiddleWare);

module.exports = app;
