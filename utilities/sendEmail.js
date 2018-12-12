const aws = require("aws-sdk");
aws.config.accessKeyId;
aws.config.secretAccessKey;
aws.config.region = "us-east-1";

function emailService(to, sub, content) {
  let errors = {};
  let ses = new aws.SES();

  let from = "support@cloudgiant.ca"; // email to contact users with, when they register, must be verified on amazon aws
  ses.sendEmail(
    {
      Source: from,
      Destination: { ToAddresses: to },
      Message: {
        Subject: {
          Data: sub
        },
        Body: {
          Html: {
            Data: content
          }
        }
      }
    },
    function(err, data) {
      if (err) {
        errors.email_not_delivered = "Email not sent";
        // fix in simplecode api,remove res
        console.log(err, errors);
      } else {
        console.log("Email sent:");
        console.log(data);
      }
    }
  );
}

module.exports = {
  emailService
};
