var nodemailer = require('nodemailer');

// Directly using the email and password (not recommended for production)
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akolangtoh1322@gmail.com',
    pass: 'staystrong123'  // Make sure this is an App Password if 2FA is enabled
  },
  tls: {
    rejectUnauthorized: false  // Ignore certificate errors
  }
});

var mailOptions = {
  from: 'akolangtoh1322@gmail.com',
  to: 'domingogabrielsantiago@yahoo.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
