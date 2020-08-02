const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);

client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hello there!',
         to: 'whatsapp:+917742371361'
       })
      .then(message => console.log(message.sid));

module.exports = client