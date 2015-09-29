/**
 * MailService
 *
 * @module      :: Service
 * @description :: Provides the sendMail method
 */

var emailStart = '<div style="width:100%; background-color: rgb(169,35,28); height: 12px;max-height: 12px; margin-bottom: 4px;">&nbsp;</div><div style="width:100%; background-color: black; max-height: 1px; height: 1px; margin-bottom: 25px;">&nbsp;</div><div style="width: 65%; margin: 0 auto; font-family: \'Helvetica\', sans-serif;">';
var emailEnd = '<br/><br/>Mit freundlichen Gr&uuml;&szlig;en,<br/>Ihr <a href="' + process.env.URL_APP + '">NoPhish</a> Team</div>';

module.exports = {
  /**
   * Sends a mail to a given address
   * @param to
   * @param subject
   * @param text (just a fallback text if html-mail is not supported, which should never happen)
   * @param html
   */
  sendMail: function (to, subject, text, html) {
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');
    var transporter = nodemailer.createTransport(smtpTransport(JSON.parse(process.env.SMTP_CONFIG)));

    var mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: subject,
      text: text,
      html: emailStart + html + emailEnd
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log(error);
        return false;
      }
      console.log('Message sent: ' + info.response);
      return true;
    });
  }
};
