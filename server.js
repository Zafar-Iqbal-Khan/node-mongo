const app = require("./app");
const { print } = require("./common/common");
const dotenv = require("dotenv");
const { connectDatabase } = require("./config/database.js");

// [HANDLING UNCAUGHT EXCEPTION] [console.log(youtube) undefined variable]
process.on("uncaughtException", (err) => {
  print(`ERROR:${err.message}`);
  print("SHUTTING DOWN THE SERVER DUE TO UNCAUGHT EXCEPTION");
  process.exit(1);
});

//[CONFIG]
dotenv.config({ path: "config/config.env" });

//[CONNECT DATABASE]
connectDatabase();

//[LISTEN]
const server = app.listen(process.env.PORT, () => {
  print(`app is listening at http://127.0.0.1:${process.env.PORT}`);
});

//[UNHANDLED PROMISE REJECTION - IF THE .ENV FILE HAS SOME ERROR]
//[SHUTDOWN THE SERVER THAT TIME]

process.on("unhandledRejection", (err) => {
  print(`ERROR: ${err.message}`);
  print("SHUTTING DOWN SERVER DUE TO UNHANDLED PROMISE REJECTION");
  server.close(() => {
    process.exit(1);
  });
});
