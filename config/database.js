const mongoose = require("mongoose");
const { print } = require("../common/common");
exports.connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
    })
    .then(() => {
      print("MongoDb connected with server......");
    });
};
