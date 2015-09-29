/**
 * ResetToken
 *
 * @module      :: Model
 * @description :: Describes a users reset token
 */

module.exports = {

  attributes: require('waterlock').models.resetToken.attributes({

  }),

  beforeCreate: require('waterlock').models.resetToken.beforeCreate,

  /**
   * Sends a reset token to the user
   * @param token
   * @param cb
   */
  afterCreate: function(token, cb){
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS
      }
    });

    //forwardUrl: process.env.URL_APP

    var mailOptions = {
      from: 'info@nophish.de',
      subject: 'Password Reset',
      text: token.token,
      html: token.token
    };

    Auth.findOne(token.owner).exec(function(err, u){
      mailOptions.to = u.email;

      transporter.sendMail(mailOptions, function(error, info){
        if(error){
          return console.log(error);
        }
        console.log('Message sent: ' + info.response);
      });
    });

    cb()
  }
};
