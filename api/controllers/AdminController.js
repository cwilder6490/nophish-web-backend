/**
 * AdminController.js
 *
 * @module      :: Controller
 * @description :: Provides the actions to alter the main applications content from the admin interface
 */

module.exports = {
  /**
   * Authenticates the admin
   * @param req
   * @param res
   * @returns {*}
   */
  authenticate: function (req, res) {
    return res.json({});
  },

  /**
   * Returns all levels
   * @param req
   * @param res
   */
  levels: function (req, res) {
    LevelService.getAllLevels(function (levels) {

      var lvls = [];
      for(var i = 0; i < levels.length; i++){
        lvls.push(levels[i].toAdminJSON());
      }

      return res.json(lvls);
    });
  },

  /**
   * Returns all questions for a given test
   * @param req
   * @param res
   */
  testQuestions: function (req, res) {
    var id = req.param('id');

    Test.find({test_id: id}).populate('questions').exec(function (err, test) {
      test = test[0];

      if(err)
        return res.forbidden({error: err});

      if(test === undefined)
        return res.notFound({message: 'Test not found!'});

      var questions = [];
      for(var i = 0; i < test.questions.length; i++){
        questions.push(test.questions[i].toAdminJSON());
      }

      return res.json(questions);
    });
  },

  /**
   * Creates level width given data and returns it
   * @param req
   * @param res
   * @returns {level}
   */
  createLevel: function (req, res) {
    Level.create().exec(function (err, level) {
      if(err)
        return res.forbidden({error: err});

        return res.json(level);
      }
    )
  },

  /**
   * Edits level width given data and returns it
   * @param req
   * @param res
   * @returns {level}
   */
  editLevel: function (req, res) {
    var level = req.body;

    Level.update({id: level.id}, level).exec(function (err, level) {
      if(err)
        return res.forbidden({error: err});

      return res.json(level);
    });
  },

  /**
   * Edits question width given data and returns it
   * @param req
   * @param res
   * @returns {level}
   */
  editTestQuestion: function (req, res) {
    var testItem = req.body;

    TestItem.update({id: testItem.id}, testItem).exec(function (err, item) {
      if(err)
        return res.forbidden({error: err});

      return res.json(item);
    });
  },

  /*
   * Database
   */
  /**
   * Purges all authentication tables
   * @param req
   * @param res
   * @returns {*}
   */
  purgeAuthentication: function (req, res) {
    FixtureService.purgeAuthentication();
    return res.json({});
  },

  /**
   * Purges all levels and creates new one from fixtures
   * @param req
   * @param res
   */
  applyLevelsFixtures: function (req, res) {
    FixtureService.applyLevelsFixtures(true, function () {
      return res.json({});
    });
  },

  /**
   * Purges the pretest and creates new one from fixtures
   * @param req
   * @param res
   */
  applyPretestFixtures: function (req, res) {
    FixtureService.applyPretestFixtures(true, function () {
      return res.json({});
    });
  },

  /**
   * Creates new posttest from fixtures
   * @param req
   * @param res
   */
  applyPosttestFixtures: function (req, res) {
    FixtureService.applyPosttestFixtures(false, function () {
      return res.json({});
    });
  },

  /**
   * Creates new retentiontest from fixtures
   * @param req
   * @param res
   */
  applyRetentiontestFixtures: function (req, res) {
    FixtureService.applyRetentiontestFixtures(false, function () {
      return res.json({});
    });
  },

  /**
   * Purges all urls and creates new ones from fixtures
   * @param req
   * @param res
   */
  applyUrlFixtures: function (req, res) {
    FixtureService.applyUrlFixtures(true, function () {
      return res.json({});
    });
  },

  /**
   * Links pretest questions to levels from fixtures
   * @param req
   * @param res
   */
  linkPretestFixturesToLevelFixtures: function (req, res) {
    FixtureService.linkPretestFixturesToLevelFixtures(function () {
      return res.json({});
    });
  },

  /**
   * Links posttest questions to levels from fixtures
   * @param req
   * @param res
   */
  linkPosttestFixturesToLevelFixtures: function (req, res) {
      FixtureService.linkPosttestFixturesToLevelFixtures(function () {
        return res.json({});
      });
    },

  /**
   * Links retentiontest questions to levels from fixtures
   * @param req
   * @param res
   */
  linkRetentiontestFixturesToLevelFixtures: function (req, res) {
      FixtureService.linkRetentiontestFixturesToLevelFixtures(function () {
        return res.json({});
      });
    },

  /**
   * Triggers reminder-email cron jon manually
   * @param req
   * @param res
   */
  sendReminderEmails: function (req, res) {
    UserService.sendReminderEmails();
    return res.json({});
  }
};
