const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);

const sendWhatsappMessage = (reciepent,message) => {
      client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: message,
         to: `whatsapp:${reciepent}`
       })
      .then(message => console.log(message.sid));
}


module.exports = sendWhatsappMessage