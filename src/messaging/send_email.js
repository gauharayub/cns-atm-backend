const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMessage = (recipient,subject,message)=>{
  try{
      sgMail.send({
        to:recipient,
        from: 'storminggak16@gmail.com',
        subject,
        text: message
      })
      console.log('message-sent')
  }
  catch(e){
      console.log('error sending the sms')
  }  
}

module.exports = sendMessage
