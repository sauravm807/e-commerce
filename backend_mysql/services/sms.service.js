const twilio = require("twilio");
const client = twilio(
  'ACa0ba551ab6b9d37ddb17596b73a2884a',
  '8266a331fda8e8094a05d3b8c871931c'
);

function sendSMS(from, to, body) {
  client.messages
    .create({ from, to, body })
    .then((message) => {
      console.log(
        `SMS message sent from ${from} to ${to}. Message SID: ${message.sid}`
      );
    })
    .catch((error) => {
      console.error(error);
    });
}
sendSMS(
"+17008444956",
 "+919304237886",
  "Hello guys"
);