const axios = require('axios');

const ONESIGNAL_APPID = process.env.B2B_ONESIGNAL_APPID;
const ONESIGNAL_RESTAPI_KEY = process.env.B2B_ONESIGNAL_RESTAPI_KEY;

const sendEmailViaOneSignal = async function (data) {
    console.log('Sending to email : ', data.email);
    const message = {
        "include_email_tokens": [data.email],
        "app_id": ONESIGNAL_APPID,
        "template_id": data.template_id,
        "custom_data": data.custom_data || {},
        "include_unsubscribed": true
    };
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_RESTAPI_KEY}`
    };

    try {
        const response = await axios.post("https://onesignal.com/api/v1/notifications", message, {
            headers: headers
        });
        console.log("Response:");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log("ERROR:");
        console.error(error.resopnse);
        throw error; // re-throwing the error for upper handling
    }
};

const sendEmailViaOneSignalwithoutTemplate = async function (data) {
    console.log(`Sending ${data?.type} email to : `, data.email);

    if (data.type === "Order-Success") {
        let name = data.name;
        let order_number = data.order_number;
        data.email_body = `<p>Hello <span>${name}</span>,</p><br /><p>Thank you for your order. We appreciate your business and will be thrilled to send your products in <strong>Order: ${order_number}</strong> as soon as possible. An email with tracking information will be sent to you once your order has shipped.</p>`
        data.email_subject = "Order Placed Successfully"

    } else if (data.type === "Admin-Order-Success") {
        let name = data.name;
        let order_number = data.order_number;
        let emailBody = `
        <p>Dear ${name},</p>
        <br />
        <p>We are pleased to inform you that an order has been successfully placed.</p>
        <p><strong>Order Number:</strong> ${order_number}</p>
        <br />
        <p>Thank you for your continued support!</p>
    `;

        // Assigning email body and subject to data object
        data.email_body = emailBody;
        data.email_subject = "Order Placed Successfully"
    }

    const message = {
        "include_email_tokens": [data.email],
        "app_id": ONESIGNAL_APPID,
        "email_subject": data.email_subject || '',
        "email_body": data.email_body || "",
        "include_unsubscribed": true
    };
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_RESTAPI_KEY}`
    };

    try {
        const response = await axios.post("https://onesignal.com/api/v1/notifications", message, {
            headers: headers
        });
        console.log("Response:");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log("ERROR:");
        console.error(error.resopnse);
        throw error; // re-throwing the error for upper handling
    }
};


module.exports = {
    sendEmailViaOneSignal,
    sendEmailViaOneSignalwithoutTemplate
}

// Testing email function

// const axios = require('axios');

// const sendNotification = function(data) {
//   const headers = {
//     "Content-Type": "application/json; charset=utf-8",
//     "Authorization": "Basic N2M4N2I0NTAtNTE0Yy00MGQ4LWJmYTUtZjI1ODFhNWY4NmRk"
//   };

//   axios.post("https://onesignal.com/api/v1/notifications", data, {
//     headers: headers
//   })
//   .then(response => {
//     console.log("Response:");
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.log("ERROR:");
//     console.error(error);
//   });
// };

// const message = {
//   "include_email_tokens": [
//       "thakurasheesh213@gmail.com"
//   ],
//   "app_id": "094653a8-2bfa-49fa-8c17-08feb5d61e91",
//   "template_id": "63163b72-ef91-4c89-a009-73bbf66e5b14",
//   "custom_data": {
//     "otpValue": "101101"
//   },
//   "include_unsubscribed": true
// };

// sendNotification(message);


