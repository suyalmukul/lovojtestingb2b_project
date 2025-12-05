const winston = require('winston');

// Create a logger
const logger = winston.createLogger({
  level: 'info', // set the logging level
  format: winston.format.combine(
    winston.format.timestamp(), // add a timestamp to each log entry
    winston.format.json() // format log entries as JSON
  ),
  transports: [
    // add a transport that writes logs to a file
    new winston.transports.File({
      filename: 'logs/myapp.log',
      maxsize: 1000000, // maximum size of the log file
      maxFiles: 5 // maximum number of log files to keep
    })
  ]
});

// Log some messages
// logger.info('Starting up the application...');
// logger.warn('Warning: disk space low!');
// logger.error('Error: unable to connect to database.');



module.exports = logger;
