const express = require("express");
const passportConfig = require("./middleware/passportConfig");
const cors = require("cors");
// if(process.env.NODE_ENV === "staging") {
//   const dotenv = require("dotenv").config()
// } else {
const dotenv = require("dotenv").config({
  path: `config/.env.${process.env.NODE_ENV}`,
});
// }

// const {removeExpiredAssociations,resetExpiredWorkerIds} = require("./utils/crontime");
const ErrorMiddleware = require("./middleware/Error");
const YAML = require("yamljs");
const swaggerJson = YAML.load("./swagger/apidataanddoc.yaml");
const swaggerUi = require("swagger-ui-express");
const allRoutes = require("./routes/index");
const json_data = require("./.well-known/assetlinks");
const { globalResponse } = require("./utils/others");
const { morgan, customFormat } = require("./utils/morganSettings");

const app = express();
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 
const server = require("http").createServer(app);

/*************************************************morgan Middleware*******************************************/
app.use(morgan(customFormat));
app.use(globalResponse)
/************************************************************************************************************/
// app.use(cors());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/************************************************************************************************************/

//All Routes
app.use("/api/v1", allRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

/********************************************************** */

// app.use(express.json());
app.use(passportConfig.initialize());
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  console.log("serving");
  res.send("Server is running...");
});

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.json(json_data);
});


// removeExpiredAssociations();
// resetExpiredWorkerIds();

module.exports = app;

app.use("*", (req, res) => {
  res.send("Route not found");
});
app.use(ErrorMiddleware);

