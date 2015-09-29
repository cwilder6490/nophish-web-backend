/**
 * PreTestController
 *
 * @module      :: Controller
 * @description	:: Provides the action to process a finished pretest
 */

module.exports = {
   /**
   * Handles finished pretest
   * @param req
   * @param res
   */
  finish: function (req, res) {
    var config = {
      pointsForRightAnswer: 50,
      pointsForWrongAnswer: -50,
      minFactorOfMaxPoints: 0.7,
      minFactorForUnlockingLevel: 0.8
    };
    var preTestAnswers = req.param('preTestAnswers');
    var correctAnswers = req.param('correctAnswers');
    var totalAnswers = req.param('totalAnswers');
    var userId = req.session.user.id;
    var now = new Date();

    // set userId for each answer
    preTestAnswers.forEach(function (answer) {
      answer.user = userId;
      answer.doneAt = now;
    });

    /**
     * Returns question belonging to the answers question id
     * @param {string} id
     * @param {array of PreTestItem} questions
     */
    function getQuestionForAnswer(id, questions){
      var question = questions.filter(function (question) {
        return question.id === id;
      });
      question = question[0];
      return question;
    }

    /**
     * Returns question belonging to the answers question id
     * @param {string} id
     * @param {array of PreTestAnswers} answers
     */
    function getAnswerForQuestion(id, answers){
      var answer = answers.filter(function (answer) {
        return answer.question === id;
      });
      answer = answer[0];
      return answer;
    }

    /**
     * Returns questions belonging to level by its id
     * @param {string} id
     * @param {array of PreTestItem} questions
     */
    function getQuestionsBelongingToLevel(id, questions){
      return questions.filter(function (question) {
        return question.belongsToLevel === id;
      });
    }

    /**
     * Returns levelStatus belonging to level by its id
     * @param {string} id
     * @param {array of LevelStatus} levelStates
     */
    function getLevelStatusBelongingToLevel(id, levelStates){
      var levelStatus = levelStates.filter(function (levelStatus) {
        return levelStatus.level === id;
      });
      return levelStatus[0];
    }

    User.update({id: userId}, {preTestDone: true, preTestDoneAt: now, preTestCorrectAnswers: correctAnswers, preTestTotalAnswers: totalAnswers}).exec(function (err, user) {
      var updatedUser = user[0];

      // Creating the preTestAnswers in the db
      TestAnswer.create(preTestAnswers)
        .then(function (answers) {
          var questionsIds = answers.map(function (answer) {
            return {id: answer.question};
          });

          // Get all the questions belonging to the answers
          TestItem.find(questionsIds).then(function(questions){

            // Get all levels
            LevelService.getAllLevels(function(levels){
              // Maximum points that could have been reached
              var maxPoints = answers.length * config.pointsForRightAnswer;
              // Actual points that have been reached
              var actualPoints = 0;

              // Iterate over all answers
              answers.forEach(function (answer) {
                var question = getQuestionForAnswer(answer.question, questions);
                // Points before howSure-factor
                var points = (answer.isPhishing === question.isPhishing) ? config.pointsForRightAnswer : config.pointsForWrongAnswer;
                // Points after howSure-factor
                points = points * answer.howSure / 5;
                // Adding points to actualPoints
                actualPoints += points;
              });

              console.log('maxPoints', maxPoints);
              console.log('actualPoints', actualPoints);

              LevelService.getDashboardLevels(userId, function (dashboardLevels, levelStates) {
                // Unlocking first level (Einfuehrung)
                LevelStatus.update({level: levels[0].id, user: userId}, {unlocked: true, unlockedThroughPreTest: false}, function (err, updatedFirstLevelStatus) {

                  // Check if actualPoints are high enough to unlock levels at all
                  if(maxPoints * config.minFactorOfMaxPoints <= actualPoints){

                    var levelsToUnlock = [];
                    var unlockedLevelInformation = [];

                    // Iterate over levels to unlock them if conditions are met
                    for(var i = 1; i < levels.length; i++){
                      var level = levels[i];
                      var questionsBelongingToLevel = getQuestionsBelongingToLevel(level.id, questions);

                      // Check if level can be unlocked, break if not
                      if(questionsBelongingToLevel.length > 0){
                        var points = 0;
                        questionsBelongingToLevel.forEach(function (q) {
                          var answer = getAnswerForQuestion(q.id, answers);
                          var p = (answer.isPhishing === q.isPhishing) ? config.pointsForRightAnswer : config.pointsForWrongAnswer;
                          p = p * answer.howSure / 5;
                          points += p;
                        });

                        if(points >= config.minFactorForUnlockingLevel * questionsBelongingToLevel.length * config.pointsForRightAnswer){
                          levelsToUnlock.push(getLevelStatusBelongingToLevel(level.id, levelStates).id);
                          unlockedLevelInformation.push({name: level.name, theme: level.theme});
                        }
                        else{
                          break;
                        }
                      }
                      else{
                        break;
                      }
                    }

                    if(levelsToUnlock.length > 0){
                      LevelStatus.update(levelsToUnlock, {unlocked: true, unlockedThroughPreTest: true}, function (err, states) {
                        if(err){
                          return res.error({error: err});
                        }
                        return res.json({user: updatedUser, unlockedLevels: unlockedLevelInformation});
                      });
                    }
                    else{
                      return res.json({user: updatedUser});
                    }
                  }else{
                    return res.json({user: updatedUser});
                  }
                });
              });
            });
          });
        });
    });

  }
};
