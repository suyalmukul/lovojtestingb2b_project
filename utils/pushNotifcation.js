const admin = require('firebase-admin');
const OneSignal = require('onesignal-node');
const fs = require('fs');


// Initialize the Firebase Admin SDK with your service account credentials
const serviceAccount = require('../config/serviceAccountKey.json');
const { default: axios } = require('axios');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // messagingSenderId: senderId,
});

// Function to send a push notification to a device token using FCM
async function sendNotification(deviceToken, title, body) {
  const message = {
    token: deviceToken,
    notification: {
      title,
      body
    }
  };



  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}



// const ONESIGNAL_APPID = '094653a8-2bfa-49fa-8c17-08feb5d61e91';
//  const ONESIGNAL_RESTAPI_KEY = 'N2M4N2I0NTAtNTE0Yy00MGQ4LWJmYTUtZjI1ODFhNWY4NmRk';
// // Initialize OneSignal with your app ID and REST API Key 
// const oneSignalClient = new OneSignal.Client(ONESIGNAL_APPID, ONESIGNAL_RESTAPI_KEY);

// // Function to send a push notification to a device token using OneSignal
// async function sendNotificationByOnesignal(deviceToken, title, body) {
//   const notification = {
//     contents: { en: body },
//     headings: { en: title },
//     include_player_ids: [deviceToken],
//   };

//   try {
//     const response = await oneSignalClient.createNotification(notification);
//     console.log('Notification sent successfully...');
//   } catch (error) {
//     console.error('Error sending notification:', error);
//   }
// }





const ONESIGNAL_APPID = process.env.B2B_ONESIGNAL_APPID;
const ONESIGNAL_RESTAPI_KEY = process.env.B2B_ONESIGNAL_RESTAPI_KEY;
const oneSignalClient = new OneSignal.Client(ONESIGNAL_APPID, ONESIGNAL_RESTAPI_KEY);

async function sendPushNotification(externalUserId, title, message) {
  const notification = {
    include_external_user_ids: [externalUserId],
    headings: { en: title },
    contents: { en: message },
    app_id: ONESIGNAL_APPID
  };

  try {
    const response = await oneSignalClient.createNotification(notification);
    console.log('✅ Notification sent:', response.body);
  } catch (error) {
    if (error instanceof OneSignal.HTTPError) {
      console.error('❌ OneSignal Error:', error.statusCode, error.body);
    } else {
      console.error('❌ Error sending notification:', error.message);
    }
  }
}
async function sendNotificationByOnesignal(deviceToken, title, body) {
  const notification = {
    contents: { en: body },
    headings: { en: title },
    include_player_ids: [deviceToken],
    // include_player_ids: ['6895ae51-dcbb-4c29-b61d-d28e4129e6bb'],
  };

  try {
    const response = await oneSignalClient.createNotification(notification);
    console.log('Notification sent successfully...');
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}


const sendEmailViaOneSignal = async (templateId, recipientEmail) => {
  try {

    const emailPayload = {
      from_name: 'Your Name',
      from_email: 'your@email.com',
      template_id: templateId,
      email: recipientEmail
    };

    const response = await axios.post('https://onesignal.com/api/v1/emails', emailPayload, {
      headers: {
        'Authorization': `Basic ${ONESIGNAL_RESTAPI_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response.data);
    throw new Error('Failed to send email via OneSignal');
  }
};

const sendEmailWithAttachmentViaOneSignal = async (templateId, recipientEmail, attachmentFilePath) => {
  try {

    // Read the attachment file
    const attachmentData = fs.readFileSync(attachmentFilePath, { encoding: 'base64' });

    const emailPayload = {
      from_name: 'Your Name',
      from_email: 'your@email.com',
      template_id: templateId,
      email: recipientEmail,
      attachments: [{
        content: attachmentData,
        filename: 'attachment.pdf', // Change the filename as needed
        type: 'application/pdf' // Change the MIME type as needed
      }]
    };

    const response = await axios.post('https://onesignal.com/api/v1/emails', emailPayload, {
      headers: {
        'Authorization': `Basic ${ONESIGNAL_RESTAPI_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response.data);
    throw new Error('Failed to send email via OneSignal');
  }
};


module.exports = { sendNotification, sendNotificationByOnesignal, sendEmailViaOneSignal, sendEmailWithAttachmentViaOneSignal,sendPushNotification };


