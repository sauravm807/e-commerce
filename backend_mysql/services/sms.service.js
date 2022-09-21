const twilio = require("twilio");
const client = twilio(
  'ACa0ba551ab6b9d37ddb17596b73a2884a',
  '3debee7039f48a92d152e556793ea88a'
);

function sendSMS(from, to, body) {
 return new Promise((resolve, reject) => {
  client.messages
    .create({ from, to, body })
    .then((message) => {
      resolve(message);
      console.log(
        `SMS message sent from ${from} to ${to}. Message SID: ${message.sid}`
      );
    })
    .catch((error) => {
      reject(error);
      console.error(error);
    });
  });
}
module.exports = sendSMS;