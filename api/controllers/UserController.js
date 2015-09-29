/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work
 *                 and all user update actions.
 */

module.exports = require('waterlock').actions.user({
  /**
   * Returns the current user
   * @param req
   * @param res
   */
  get: function (req, res) {
    var userId = req.session.user.id;
    User.findOne({id: userId}).exec(function (err, user) {
      if(err) return res.error({error: err});

      return res.json(user);
    });
  },

  /**
   * Updates the user preTestDone property and returns the user
   * @param req
   * @param res
   */
  didPreTest: function (req, res) {
    User.update({id: req.session.user.id}, {preTestDone: true}).exec(function (err, user) {
      if(err) return res.forbidden({error: err});

      return res.json(user);
    });
  },

  /**
   * Updates the user postTestDone property and returns the user
   * @param req
   * @param res
   */
  didPostTest: function (req, res) {
    User.update({id: req.session.user.id}, {postTestDone: true}).exec(function (err, user) {
      if(err) return res.forbidden({error: err});

      return res.json(user);
    });
  },

  /**
   * Updates the user retentionTestDone property and returns the user
   * @param req
   * @param res
   */
  didRetentionTest: function (req, res) {
    User.update({id: req.session.user.id}, {retentionTestDone: true}).exec(function (err, user) {
      if(err) return res.forbidden({error: err});

      return res.json(user);
    });
  },

  /**
   * Updates the user preTestSkipped property and returns the user
   * @param req
   * @param res
   */
  skippedPreTest: function (req, res) {
    User.update({id: req.session.user.id}, {preTestSkipped: true}).exec(function (err, user) {
      if(err) return res.forbidden({error: err});

      return res.json(user);
    });
  },

  /**
   * Updates the user and returns the user
   * @param req
   * @param res
   */
  saveOptions: function (req, res) {
    var params = req.params.all();

    var userUpdate = {};
    if(params.sex !== undefined) userUpdate.sex = params.sex;
    if(params.yearOfBirth !== undefined && ! isNaN(parseInt(params.yearOfBirth))) userUpdate.yearOfBirth = parseInt(params.yearOfBirth);
    if(params.addressFormal !== undefined) userUpdate. addressFormal = params. addressFormal;
    if(params.usedDesktopBrowser !== undefined) userUpdate.usedDesktopBrowser = params.usedDesktopBrowser;
    if(params.usedMailClient !== undefined) userUpdate.usedMailClient = params.usedMailClient;

    User.update({id: req.session.user.id}, userUpdate).exec(function (err, user) {
      if(err) return res.forbidden({error: err});

      return res.json(user);
    });
  },

  /**
   * Requests certificate for user if unlocked
   * @param req
   * @param res
   */
  requestCertificate: function (req, res){
    var name = req.param('name');
    var to = process.env.CERTIFICATE_MAIL;
    waterlock.engine.findAuth({user: req.session.user.id}, function(err, user) {
      if(err) return res.error({error: err});

      if(! user.certificateUnlocked){
        return res.forbidden({error: 'Certificate not unlocked!'});
      }

      MailService.sendMail(to, 'Anforderung Zertifikat', 'E-Mail: ' + user.auth.email + '\nName: ' + name, 'E-Mail: ' + user.auth.email + '<br/>Name: ' + name);

      return res.json({});
    });
  },

  /**
   * Sends new confirmation-link to users email and updates user
   * @param req
   * @param res
   */
  requestConfirmEmail: function (req, res){
    User.findOne({id: req.session.user.id}).exec(function (err, user) {
      if(err) return res.forbidden({error: err});

      if(user.emailConfirmed === true){
        return res.json({});
      }

      var token = User.getToken();

      User.update({id: user.id}, {emailConfirmationToken: token}).exec(function (err, user) {
        user = user[0];

        waterlock.engine.findAuth({user: user.id}, function(err, user) {
          User.sendConfirmationEmail(user.auth.email, user);
          return res.json({});
        });
      });
    });
  },

  /**
   * Confirmes email if token is valid for given email
   * @param req
   * @param res
   */
  confirmEmail: function (req, res) {
    var token = req.param('token');
    if(token !== undefined){
      User.findOne({id: req.session.user.id}).exec(function (err, user) {
        if(err) return res.forbidden({error: err});

        if(user.emailConfirmed === true){
          return res.forbidden({error: 'User already confirmed!'});
        }

        if(user.emailConfirmationToken === token){
          User.update({id: user.id}, {emailConfirmed: true}).exec(function (err, user) {
            user = user[0];
            return res.json(user);
          });
        }
        else{
          res.forbidden({error: 'Wrong token!'});
        }

      });
    }
    else{
      return res.forbidden({error: 'No token was given!'});
    }
  },

  /**
   * (Dev-Action) Unlocks retentiontest by setting the date it was done two months in the past
   * @param req
   * @param res
   */
  unlockRetentionTest: function (req, res) {
    var userId = req.session.user.id;
    var pw = req.param('password');
    if(pw === 'dev'){
      var twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

      User.update({id: userId}, {lastReminderEmail: twoMonthsAgo}).exec(function (err, user) {
        if(err) return res.error({error: err});

        Test.findOne({test_id: 2}).populate('questions').exec(function (err, test) {
          TestAnswer.update({user: userId}, {createdAt: twoMonthsAgo, updatedAt: twoMonthsAgo}).exec(function (err, answer) {
            UserService.sendReminderEmails();
            return res.json({});
          });
        });
      });
    }
    else{
      return res.forbidden({});
    }
  },

  /**
   * Updates the user retentionTestRepeatDate property and returns the user
   * @param req
   * @param res
   */
  setRetentionTestRepeatDate: function (req, res) {
    var userId = req.session.user.id;
    var inSixMonths = new Date();
    inSixMonths.setDate(inSixMonths.getDate() + (30 * 6));

    User.update({id: userId}, {retentionTestRepeatDate: inSixMonths}).exec(function (err, user) {
      if(err) return res.error({error: err});
      user = user[0];
      return res.json({user: user});
    });
  }
});
