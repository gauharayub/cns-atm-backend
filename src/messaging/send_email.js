const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMessage = (recipient,subject,message)=>{
  try{
      sgMail.send({
        to:recipient,
        from: 'technovikings.aai@gmail.com',
        subject,
        text: message
      })
      console.log('message-sent')
  }
  catch(e){
      console.log('error sending the email')
  }  
}

module.exports = sendMessage
