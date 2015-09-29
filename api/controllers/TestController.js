/**
 * TestController
 *
 * @module      :: Controller
 * @description	:: Provides the actions to finish and get both post and retentiontest
 */

/**
 * Creates testanswers for test and returns updated user object
 * @param req
 * @param res
 * @param test_id
 */
var finishTest = function(req, res, test_id){
  var testAnswers = req.param('answers');
  var correctAnswers = req.param('correctAnswers');
  var totalAnswers = req.param('totalAnswers');
  var userId = req.session.user.id;
  var now = new Date();

  // set userId for each answer
  testAnswers.forEach(function (answer) {
    answer.user = userId;
    answer.doneAt = now;
  });


  User.findOne({id: userId}).exec(function (err, user) {
    if(err) return res.error({error: err});

    if(user === undefined) return res.forbidden({error: 'User not found'});

    // Creating the testAnswers in the db
    TestAnswer.create(testAnswers).exec(function (err, answers) {
      if(err) return res.error({error: err});

      var update = {};
      if(test_id === 2) {
        update.postTestDone = true;
        update.postTestDoneAt = now;
        update.postTestCorrectAnswers = correctAnswers;
        update.postTestTotalAnswers = totalAnswers;

        if(correctAnswers === totalAnswers){
          update.certificateUnlocked = true;
        }
      }
      else if(test_id === 3){
        update.retentionTestDone = true;
        update.retentionTestDoneAt = now;
        update.retentionTestCorrectAnswers = correctAnswers;
        update.retentionTestTotalAnswers = totalAnswers;
      }

      User.update({id: user.id}, update).exec(function (err, user) {
        if(err) return res.error({error: err});

        if(Array.isArray(user)){
          user = user[0];
        }

        Level.find().exec(function (err, levels) {
          if(err) return res.error({error: err});

          return res.json({success: true, answers: answers, user: user, levels: levels});
        });
      });
    });
  });
};

module.exports = {
  /**
   * Returns a test by given test_id
   * @param req
   * @param res
   */
  find: function (req, res) {
    var id  = req.param('id');
    Test.findOne({test_id: id}).populate('questions').exec(function (err, test) {
      if (err) {
        res.forbidden(err);
      }

      res.json({test: test});
    });
  },

  /**
   * Handles finished posttest and returns updated user object
   * @param req
   * @param res
   */
  finishPostTest: function (req, res) {
    return finishTest(req, res, 2);
  },

  /**
   * Handles finished retentiontest and returns updated user object
   * @param req
   * @param res
   */
  finishRetentionTest: function (req, res) {
    return finishTest(req, res, 3);
  }
};
