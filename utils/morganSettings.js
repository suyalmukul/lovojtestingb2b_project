const morgan = require("morgan");
const chalk = require("chalk");

morgan.token("source", function (req) {
  return req.get("User-Agent") || "Unknown Source";
});

function customFormat(tokens, req, res) {
  const status = res.statusCode;
  const color = status >= 200 && status < 300 ? chalk.green : chalk.red;

  // Modify the format to include yellow color for method and URL
  const methodAndUrl = color(`${tokens.method(req, res)} ${tokens.url(req, res)}`);
  
  // Wrap the "Hit from" part in green color
  const hitFrom = chalk.green(tokens.source(req));

  // return `API Route: "${methodAndUrl}" Status: ${color(status)} Hit Source: "${hitFrom}"`;
  return `API Route: "${methodAndUrl}" Status: ${color(status)}`;
}

module.exports = { morgan, customFormat };

