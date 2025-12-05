const cron = require('node-cron');
const User = require('../models/user');
const QuickOrderStatus = require('../models/quickorderStatus.model');
const QuickOrderStatusOnline = require("../models/quickorderStatusB2C.model");
const { default: mongoose } = require('mongoose');
const { pushNotAssignedForCron } = require('../services/others.service');

// Function to remove the ID from the Associated array if the time has exceeded 10 minutes
async function removeExpiredAssociations() {
  try {
    const users = await User.find();
    const currentTime = Date.now();

    for (const user of users) {
      if (user.Associated && user.Associated.length > 0) {
        const updatedAssociated = user.Associated.filter((entry) => {
          const timeDifference = currentTime - entry.timer;
          const minutesDifference = timeDifference / (1000 * 60);

          // If the time difference is less than or equal to 10 minutes, keep the ID in the Associated array
          return minutesDifference <= 10;
        });

        // Update the Associated array for the user in the database
        user.Associated = updatedAssociated;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error while removing expired associations:', error);
  }
}

// Schedule the cron job to run every 5 minutes
// cron.schedule('*/5 * * * *', () => {
//   removeExpiredAssociations();
// }, {
//   scheduled: true, 
//   timezone: 'UTC', 
// });


/******** Working Cron ***/


async function resetExpiredWorkerIds(model) {
  console.log("Cron triggered")
  try {
    const orders = await model.find();
    const currentTime = Date.now();
    const timeLimitInMinutes = 1; // Set the time limit 

    for (const order of orders) {
      if (order.cutterStatus) {
        order.cutterStatus.forEach(async (item, index) => {
          const timeDifference = currentTime - new Date(item.timmer);
          const minutesDifference = timeDifference / (1000 * 60);
          if (item.status === "InProgress" && !item.problem && minutesDifference > timeLimitInMinutes) {
            await pushNotAssignedForCron(order, item);
            order.cutterStatus.splice(index, 1);
            await order.save();
          }
        });
      }
    }
  } catch (error) {
    console.error('Error while resetting expired workerIds:', error);
  }
}

// cron.schedule('* * * * *', () => {
//   resetExpiredWorkerIds(QuickOrderStatus);
//   resetExpiredWorkerIds(QuickOrderStatusOnline);
// }, {
//   scheduled: true, 
//   timezone: 'UTC', 
// });

// resetExpiredWorkerIds(QuickOrderStatus);
// resetExpiredWorkerIds(QuickOrderStatusOnline);



// Export the function to use in other parts of the application if needed
module.exports = { removeExpiredAssociations, resetExpiredWorkerIds };
