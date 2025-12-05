// const AWS = require('aws-sdk');

// // Configure the AWS SDK with your credentials and region
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
// });

// // const sendSMS = async (message, phoneNumber, senderID) => {
// //     const params = {
// //         Message: message,
// //         PhoneNumber: '+' + phoneNumber,
// //         MessageAttributes: {
// //             'AWS.SNS.SMS.SenderID': {
// //                 'DataType': 'String',
// //                 'StringValue': senderID
// //                 // 'StringValue': process.env.AWS_SNS_SENDER_ID
// //             },
// //             // 'AWS.SNS.SMS.SMSType': {
// //             //     'DataType': 'String',
// //             //     'StringValue': 'Transactional'
// //             // }
// //         }
// //     };

// //     try {
// //         const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
// //         const data = await sns.publish(params).promise();
// //         return { MessageID: data.MessageId };
// //     } catch (err) {
// //         throw err;
// //     }
// // };

// const sendSMS = async (message, phoneNumber, senderID, entityId, templateId) => {
//     const params = {
//         Message: message,
//         PhoneNumber: '+' + phoneNumber,
//         MessageAttributes: {
//             'AWS.SNS.SMS.SenderID': {
//                 'DataType': 'String',
//                 'StringValue': senderID
//             },
//             'AWS.MM.SMS.EntityId': {
//                 'DataType': 'String',
//                 'StringValue': entityId
//             },
//             'AWS.MM.SMS.TemplateId': {
//                 'DataType': 'String',
//                 'StringValue': templateId
//             }
//         }
//     };

//     try {
//         const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
//         const data = await sns.publish(params).promise();
//         return { MessageID: data.MessageId };
//     } catch (err) {
//         throw err;
//     }
// };

// module.exports = {
//     sendSMS
// }




const AWS = require('aws-sdk');

// Configure the AWS SDK with your credentials and region
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const sendSMS = async (message, phoneNumber, senderID, entityId, templateId) => {
    const params = {
        Message: message,
        PhoneNumber: '+' + phoneNumber,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': senderID
            }
        }
    };

    // Add EntityId if provided
    if (entityId) {
        params.MessageAttributes['AWS.MM.SMS.EntityId'] = {
            'DataType': 'String',
            'StringValue': entityId
        };
    }

    // Add TemplateId if provided
    if (templateId) {
        params.MessageAttributes['AWS.MM.SMS.TemplateId'] = {
            'DataType': 'String',
            'StringValue': templateId
        };
    }

    try {
        const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
        const data = await sns.publish(params).promise();
        return { MessageID: data.MessageId };
    } catch (err) {
        throw err;
    }
};

module.exports = {
    sendSMS
};





