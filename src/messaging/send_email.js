const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMessage = (reciepent,subject,message)=>{
    sgMail.send({
        to:reciepent,
        from: 'gauharayub14@gmail.com',
        subject,
        text: message
      })
      console.log('message-sent')
}

module.exports = sendMessage
