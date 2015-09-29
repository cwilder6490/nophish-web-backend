/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 */

module.exports = {
  attributes: require('waterlock').models.user.attributes({
    yearOfBirth: {
      type: 'integer',
      defaultsTo: 0,
      required: true
    },

    sex: {
      type: 'string',
      enum: ['male', 'female', 'undefined'],
      defaultsTo: 'undefined',
      required: true
    },

    addressFormal: {
      type: 'boolean',
      defaultsTo: true,
      required: true
    },

    usedDesktopBrowser: {
      type: 'string',
      enum: ['chrome', 'firefox', 'safari', 'ie', 'undefined'],
      defaultsTo: 'undefined',
      required: true
    },

    usedMailClient: {
      type: 'string',
      enum: ['thunderbird', 'outlook', 'gmx', 'gmail', 'web', 'undefined'],
      defaultsTo: 'undefined',
      required: true
    },

    emailConfirmationToken: {
      type: 'string',
      defaultsTo: 'default',
      required: true
    },

    emailConfirmed: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    hasToBeConfirmed: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    hasToDoPretest: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },


    preTestSkipped: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    preTestDone: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    preTestDoneAt: {
      type: 'date'
    },

    preTestCorrectAnswers: {
      type: 'integer'
    },

    preTestTotalAnswers: {
      type: 'integer'
    },


    postTestUnlocked: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    postTestDone: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    postTestDoneAt: {
      type: 'date'
    },

    postTestCorrectAnswers: {
      type: 'integer'
    },

    postTestTotalAnswers: {
      type: 'integer'
    },

    certificateUnlocked: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    retentionTestUnlocked: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    retentionTestDone: {
      type: 'boolean',
      defaultsTo: false,
      required: true
    },

    retentionTestDoneAt: {
      type: 'date'
    },

    retentionTestCorrectAnswers: {
      type: 'integer'
    },

    retentionTestTotalAnswers: {
      type: 'integer'
    },

    retentionTestRepeatDate: {
      type: 'date'
    },

    levelStates: {
      collection: 'levelStatus',
      via: 'user'
    },

    lastReminderEmail: {
      type: 'date'
    },

    /**
     * Deletes sensible data
     * @returns {*}
     */
    toJSON: function() {
      var obj = this.toObject();

      delete obj.attempts;
      delete obj.jsonWebTokens;
      delete obj.auth;
      delete obj.emailConfirmationToken;
      delete obj.createdAt;
      delete obj.updatedAt;

      return obj;
    }
  }),

  /**
   * Returns a random string token
   * @returns {string}
   */
  getToken: function(){
    var token = '';

    for(var i = 0; i < 10; i++){
      token += Math.random().toString(36).substring(7);
    }

    return token;
  },

  /**
   * Sends the confirmation mail to the user
   * @param email
   * @param user
   */
  sendConfirmationEmail: function(email, user){
    var confirmUrl =  process.env.URL_APP + '/confirm-email/' + user.emailConfirmationToken;
    MailService.sendMail(email, 'E-Mail Verifikation', 'Bitte besuchen Sie folgende Addresse: ' + confirmUrl, '<b>Herzlich Willkommen bei NoPhish</b><br/><br/>Vielen Dank f&uuml;r Ihre Registrierung. Jetzt fehlt nur noch ein Schritt, um alle Funktionen freizuschalten und ihre E-Mail Adresse zu best&auml;tigen.<br/>Um sie endg&uuml;ltig zu verifizieren klicken Sie bitte <a href="' + process.env.URL_APP + '/confirm-email/' + user.emailConfirmationToken + '">hier</a>.<br/><br/>Sollten Sie diese Mail versehentlich erhalten, oder sich nicht bei NoPhish angemeldet haben, ignorieren Sie sie bitte.');
  },

  /**
   * Inserts defaults before creation
   * @param values
   * @param cb
   */
  beforeCreate: function(values, cb){
    var token = User.getToken();

    values.emailConfirmationToken = token;
    values.lastReminderEmail = new Date();
    values.retentionTestRepeatDate = new Date();

    cb();
  },

  beforeUpdate: require('waterlock').models.user.beforeUpdate
};
