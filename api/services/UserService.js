/**
 * UserService
 *
 * @module      :: Service
 * @description :: Provides methods for user-related interactions
 */

var retentionTestDelayInDays = 28;
var retentionTestReminderDelayInDays = 7;
var postTestReminderDelayInDays = 1;
var gameReminderDelayInDays = 7;

var log = function (auth, text) {
  console.log(auth.email + ': ' + text);
};

/**
 * Returns the difference of two times in days
 * @param a
 * @param b
 * @returns {number}
 */
var getTimeDiff = function (a, b) {
  var timeDiff = Math.abs(a - b);
  var diffDays = timeDiff / (1000 * 3600 * 24);
  return diffDays;
};

var emailHtmlRetentionInitialFormal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'es ist nun vier Wochen her, dass Sie den Nachtest bei NoPhish absolviert haben.<br/>',
  'Stellen Sie in einem letzten Test fest, ob Sie sich das Erlernte behalten haben, wo sich noch Fehler einschleichen und worauf Sie in Zukunft achten sollten, um noch besser Phishing Angriffe zu erkennen.<br/>',
  'Sie können den Retentiontest direkt auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlRetentionInitialInformal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'es ist nun vier Wochen her, dass Du den Nachtest bei NoPhish absolviert hast.<br/>',
  'Stell in einem letzten Test fest, ob Du dir das Erlernte behalten hast, wo sich noch Fehler einschleichen und worauf Du in Zukunft achten solltest, um noch besser Phishing Angriffe zu erkennen.<br/>',
  'Du kannst den Retentiontest direkt auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlRetentionReminderFormal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'Wir möchten Sie daran erinnern, dass Sie den Retentiontest noch nicht absolviert haben.<br/>',
  'Sie können den Retentiontest direkt auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlRetentionReminderInformal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'Wir möchten dich daran erinnern, dass du den Retentiontest noch nicht absolviert hast.<br/>',
  'Du kannst den Retentiontest direkt auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlPostReminderFormal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'wir möchten Sie daran erinnern, dass Sie den Nachtest noch nicht absolviert haben.<br/>',
  'Hier haben Sie die Möglichkeit festzustellen, inwieweit Sie sich gegenüber dem Vortest verbessert haben.<br>',
  'Sie können den Nachtest auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlPostReminderInformal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'wir möchten dich daran erinnern, dass Du den Nachtest noch nicht absolviert hast.<br/>',
  'Hier hast Du die Möglichkeit festzustellen, inwieweit Du dich gegenüber dem Vortest verbessert hast.',
  'Du kannst den Nachtest auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlReminderFormal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'Sie waren schon länger nicht mehr auf NoPhish aktiv und haben noch nicht alle Level durchgespielt.<br/>',
  'Besuchen Sie doch <a href="' + process.env.URL_APP + '">NoPhish</a>, um weiter zu spielen und in Zukunft alle Phishing-Angriffe zu  erkennen.'
].join('');

var emailHtmlReminderInformal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'Du warst schon länger nicht mehr auf NoPhish aktiv und hast noch nicht alle Level durchgespielt.<br/>',
  'Besuch doch <a href="' + process.env.URL_APP + '">NoPhish</a>, um weiter zu spielen und in Zukunft alle Phishing-Angriffe zu erkennen.'
].join('');

var emailHtmlSixMonthReminderFormal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'vor 6 Monaten haben Sie den Retentiontest absolviert.<br/>',
  'Nun haben Sie die Gelegenheit Ihr Wissen noch einmal auf die Probe zu stellen! Der Retentiontest wurde wieder für Sie freigeschaltet.',
  'Sie können den Retentiontest direkt auf der Übersicht unter Status aufrufen.'
].join('');

var emailHtmlSixMonthReminderInformal = [
  '<b>Lieber NoPhish Nutzer,</b><br/><br/>',
  'vor 6 Monaten hast du den Retentiontest absolviert.<br/>',
  'Nun hast du die Gelegenheit dein Wissen noch einmal auf die Probe zu stellen! Der Retentiontest wurde wieder für dich freigeschaltet.',
  'Du kannst den Retentiontest direkt auf der Übersicht unter Status aufrufen.'
].join('');

module.exports = {

  /**
   * Checks for each user if emails have to be send and sends them
   */
  sendReminderEmails: function () {
    Auth.find().populate('user').exec(function (err, auths) {
      auths.forEach(function (auth) {
        Jwt.find({owner: auth.user.id}).exec(function (err, jwts) {
          var usesCriteria = jwts.map(function (jwt) {
            return {jsonWebToken: jwt.id};
          });

          Use.find(usesCriteria).sort('updatedAt desc').limit(1).exec(function (err, uses) {
            var use = uses[0];
            var lastRequestDate = new Date(use.createdAt);
            var now = new Date();

            var diffDays = getTimeDiff(now, lastRequestDate);

            if(auth.user.retentionTestDone === true){
              var retentionTestRepeatDate = new Date(auth.user.retentionTestRepeatDate);
              if(retentionTestRepeatDate < new Date()){
                User.update({id: auth.user.id}, {retentionTestDone: false}).exec(function (err, user) {
                  log(auth, 'Unlocking Retention Test again');
                  var text = auth.user.addressFormal === true ? emailHtmlRetentionInitialFormal : emailHtmlRetentionInitialInformal;
                  MailService.sendMail(auth.email, 'Retentiontest freigeschaltet', 'Der Retentiontest wurde freigeschaltet und ist nun auf der Übersicht unter Status auswählbar.', text);
                });
              }
              return;
            }

            if(auth.user.postTestDone){
              if(auth.user.retentionTestUnlocked !== true){
                Test.findOne({test_id: 2}).populate('questions').exec(function (err, test) {
                  var questionId = test.questions[0].id;
                  TestAnswer.findOne({question: questionId, user: auth.user.id}).exec(function (err, answer) {
                    log(auth, 'Posttest done on ' + getTimeDiff(now, answer.createdAt) + ' days ago');
                    if(getTimeDiff(now, answer.createdAt) >= retentionTestDelayInDays){
                      User.update({id: auth.user.id}, {lastReminderEmail: now, retentionTestUnlocked: true}).exec(function (err, user) {
                        log(auth, 'Unlocking Retention Test');
                        var text = auth.user.addressFormal === true ? emailHtmlRetentionInitialFormal : emailHtmlRetentionInitialInformal;
                        MailService.sendMail(auth.email, 'Retentiontest freigeschaltet', 'Der Retentiontest wurde freigeschaltet und ist nun auf der Übersicht unter Status auswählbar.', text);
                      });
                    }
                  });
                });
              }
              else{
                if(auth.user.retentionTestDone === true) return;
                if(getTimeDiff(now, auth.user.lastReminderEmail) > retentionTestReminderDelayInDays){
                  User.update({id: auth.user.id}, {lastReminderEmail: now}).exec(function (err, user) {
                    log(auth, 'Reminding User of Retention Test');
                    var text = auth.user.addressFormal === true ? emailHtmlSixMonthReminderFormal : emailHtmlSixMonthReminderInformal;
                    MailService.sendMail(auth.email, 'Retentiontest wieder freigeschaltet', 'Der Retentiontest wurde wieder freigeschaltet und ist nun auf der Übersicht unter Status auswählbar.', text);
                  });
                }
              }
            }
            else{
              if(auth.user.postTestUnlocked && getTimeDiff(now, auth.user.lastReminderEmail) >= postTestReminderDelayInDays){
                User.update({id: auth.user.id}, {lastReminderEmail: now}).exec(function (err, user) {
                  log(auth, 'Reminding User of Post Test');
                  var text = auth.user.addressFormal === true ? emailHtmlPostReminderFormal : emailHtmlPostReminderInformal;
                  MailService.sendMail(auth.email, 'Nachtest noch nicht absolviert', 'Der Nachtest wurde noch nicht absolviert.', text);
                });
              }
              else if(getTimeDiff(now, auth.user.lastReminderEmail) >= gameReminderDelayInDays){
                User.update({id: auth.user.id}, {lastReminderEmail: now}).exec(function (err, user) {
                  log(auth, 'Reminding User');
                  var text = auth.user.addressFormal === true ? emailHtmlReminderFormal : emailHtmlReminderInformal;
                  MailService.sendMail(auth.email, 'Inaktivität', '', text);
                });
              }
            }
          });
        });
      });
    });
  }
};
