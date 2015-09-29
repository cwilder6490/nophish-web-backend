/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: Provides the base authentication
 *                 actions used to make waterlock work.
 *                 and the extended functionality for the graphical passwordm,
 *                 password-reset and account deletion.
 */

var bcrypt = require('bcryptjs');
var _ = require('lodash');

module.exports = require('waterlock').waterlocked({

  /**
   * Validates the given data and creates an new user of valid.
   * @param req
   * @param res
   * @returns {*}
   */
  register: function(req, res) {
    var params = req.params.all(),
      def = waterlock.Auth.definition,
      criteria = { },
      scopeKey = def.email !== undefined ? 'email' : 'username';

    var attr = {
      password: params.password,
      isThingsPassword: params.isThingsPassword
    };

    if(params.isThingsPassword){
      attr['thingsData'] = params.thingsData;
    }

    attr[scopeKey] = params[scopeKey];
    criteria[scopeKey] = attr[scopeKey];

    if( ! ValidationService.validateEmail(params.email) ){
      return res.forbidden({error: "Email is not valid"});
    }

    if( ! ValidationService.validatePassword(params.password) ){
      return res.forbidden({error: "Password is not valid"});
    }

    waterlock.engine.findAuth(criteria, function(err, user) {
      if (user)
        return res.forbidden({error: "User already exists"});
      else
        waterlock.engine.findOrCreateAuth(criteria, attr, function(err, user) {
          if (err)
            return res.forbidden(err);

          User.sendConfirmationEmail(params.email, user);

          var userUpdate = {};
          if(params.sex !== undefined) userUpdate.sex = params.sex;
          if(params.yearOfBirth !== undefined && ! isNaN(parseInt(params.yearOfBirth))) userUpdate.yearOfBirth = parseInt(params.yearOfBirth);
          if(params.addressFormal !== undefined) userUpdate. addressFormal = params. addressFormal;
          if(params.usedDesktopBrowser !== undefined) userUpdate.usedDesktopBrowser = params.usedDesktopBrowser;
          if(params.usedMailClient !== undefined) userUpdate.usedMailClient = params.usedMailClient;

          userUpdate.hasToBeConfirmed = (process.env.EMAIL_HAS_TO_BE_CONFIRMED === true);

          if(Object.keys(userUpdate).length > 0){
            User.update({id: user.id}, userUpdate).exec(function (err, user) {
              if (err)
                return res.forbidden(err);

              return res.ok();
            });
          }

          return res.ok();
        });
    });
  },

  /**
   * Generates graphical password and returns it
   * @param req
   * @param res
   */
  generateThingsPassword: function(req, res){
    var password = [];
    var tmpCollections = _.shuffle(sails.config.things.collectionNames.slice());

    for(var i = 0; i < sails.config.things.imagesPerPassword; i++){
      var passwordItem = {};
      var images = [];
      var tmpImages = _.shuffle(_.range(1, sails.config.things.imagesPerCollection + 1));

      for(var j = 0; j < sails.config.things.imagesPerGrid; j++){
        images.push(ThingsService.getConvertedImageName(tmpImages[j]));
      }

      var passwordImage = images[Math.floor(Math.random()*images.length)];

      passwordItem['collection'] = tmpCollections[i];
      passwordItem['images'] = images;
      passwordItem['passwordImage'] = passwordImage;
      password.push(passwordItem);
    }

    var passwordJSON = {};
    passwordJSON['password'] = password;
    passwordJSON['filePath'] = sails.config.things.filePath;
    res.json(passwordJSON);
  },

  /**
   * Checks if the user has a graphical password and returns the meta-password if so
   * @param req
   * @param res
   * @returns {*}
   */
  getThingsData: function(req, res){
    var params = req.params.all();
    var email = params.email;
    if(email === undefined) return res.forbidden({error: 'Email not given'});

    waterlock.engine.findAuth({email: email}, function(err, user) {
      if (user){
        var data = {
          isThingsPassword: user.auth.isThingsPassword,
          thingsData: user.auth.thingsData ? user.auth.thingsData : [],
          filePath: sails.config.things.filePath
        };
        return res.json(data);
      }
      else{
        return res.forbidden({error: 'User does not exist'});
      }
    });
  },

  /**
   * Updates the auth object of a user with the new password (and type)
   * @param req
   * @param res
   */
  changePassword: function (req, res) {
    var params = req.params.all();

    var authUpdate = {
      password: params.password,
      isThingsPassword: false
    };

    if(params.thingsData !== undefined && typeof(params.thingsData) === 'object'){
      authUpdate.isThingsPassword = true;
      authUpdate.thingsData = params.thingsData;
    }

    User.findOne({id: req.session.user.id}).exec(function (err, user) {
      if (err)
        return res.forbidden(err);

      Auth.update({id: user.auth}, authUpdate).exec(function (err, auth) {
        if (err)
          return res.forbidden(err);

        return res.ok();
      })
    });
  },

  /**
   * Deletes the auth object of a user
   * @param req
   * @param res
   */
  deleteAccount: function (req, res) {
    var userId = req.session.user.id;

    Auth.destroy({user: userId}).exec(function (err) {
      if(err) return res.error({error: err});
      return res.json({success: true});
    });
  },

  /**
   * Generates reset token, updates user with it and sends mail with token to user
   * @param req
   * @param res
   */
  requestPasswordReset: function (req, res) {
    var email = req.param('email');

      waterlock.engine.findAuth({email: email}, function(err, user) {
        if(err) return res.error({error: err});

        var auth = user.auth;
        if( ! auth) return res.json({success: false});

        var token = Math.random().toString(36).slice(-10) + '' + Math.random().toString(36).slice(-10) + '' + Math.random().toString(36).slice(-10);

        Auth.update({id: auth.id}, {passwordResetToken: token}).exec(function (err, auth) {
          if(err) return res.error({error: error});

          auth = auth[0];

          var resetUrl =  process.env.URL_APP + '/reset-password/' + auth.passwordResetToken;

          MailService.sendMail(email, 'Passwort zurücksetzen', resetUrl, '<b>Für Ihren NoPhish-Account wurde ein Passwort-Reset angefordert.</b><br/><br/>Falls Sie diese Email angefordert haben, klicken Sie bitte <a href="' + resetUrl + '">hier</a> um ein neues Passwort zu erhalten.<br>Ignorieren Sie diese Email, wenn Sie sie nicht angefordert haben.');
          return res.json({success: true});
        });
      });
  },

  /**
   * Checks if token is valid, if it is, generates a new aplhanumerical password and sends it via mail to the user
   * @param req
   * @param res
   * @returns {*}
   */
  resetPassword: function (req, res) {
    var email = req.param('email');
    var token = req.param('token');

    if(token === undefined || token.length < 10) return res.error({error: 'Token not valid'});

    waterlock.engine.findAuth({email: email}, function(err, user) {
      if(err) return res.error({error: err});

      if( ! user) return res.json({success: false});

      var auth = user.auth;
      if( ! auth) return res.json({success: false});
      if(auth.passwordResetToken !== token) return res.json({success: false});
      var password = Math.random().toString(36).slice(-10);

      var authUpdate = {
        password: password,
        isThingsPassword: false,
        passwordResetToken: ''
      };

      Auth.update({id: auth.id}, authUpdate).exec(function (err, auth) {
        if(err) return res.error({error: error});

        auth = auth[0];

        MailService.sendMail(email, 'Passwort zurückgesetzt', password, '<b>Das Passwort Ihres NoPhish-Account wurde zurückgesetzt.</b><br/><br/>Ihr neues Password lautet:<br>' + password + '<br><br>Bitte ändern Sie das Passwort so schnell wie möglich.');
        return res.json({success: true});
      });
    });
  }
});
