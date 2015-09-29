/**
 * LevelService
 *
 * @module      :: Service
 * @description :: Provides methods for level interactions
 */

module.exports = {
  /**
   * Returns all levels sorted by position
   * @param cb
   */
  getAllLevels: function (cb) {
    Level.find().sort('position asc').exec(function(err, level) {
      if(err)
        cb(null);

      cb(level);
    });
  },

  /**
   * Returns the dashboard-levels which are build from the level and the according level-status model
   * If the level-status does not exist it will be created
   * @param userId
   * @param cb
   */
  getDashboardLevels: function (userId, cb) {
    LevelService.getAllLevels(function (levels) {
      var dashboardLevels = [];

      var levelStateSearch = [];
      for(var j = 0; j < levels.length; j++) {
        levelStateSearch.push(
          {
            level: levels[j].id,
            user: userId
          }
        );
      }

      LevelStatus.findOrCreate(levelStateSearch,levelStateSearch).exec(function (err, levelStates){

        for(var i = 0; i < levels.length; i++){
          var level = levels[i];
          var status = levelStates[i];

          if(level.level_id.substr(0,1) === 'E' && status.unlocked === false){
            status.unlocked = true;
            status.save();
          }

          dashboardLevels.push(
            {
              id: level.id,
              level_id: level.level_id,
              theme: level.theme,
              name: level.name,
              description: level.description,
              unlocked: status.unlocked,
              unlockedThroughPreTest: status.unlockedThroughPreTest,
              score: status.score,
              correctAnswers: status.correctAnswers,
              totalItems: level.overallUrlNumber + (3 - status.remainingLives),
              showExercise: level.showExercise
            }
          );
        }

        cb(dashboardLevels, levelStates);
      });
    });
  },

  /**
   * Mutates a given url with the level mutation code and returns the result
   * @param level
   * @param url
   * @returns {*}
   */
  mutateUrl: function (level, url){
    url.isPhish = true;
    url.hasExtendedValidationCertificate = false;
    url.level = level.level_id;
    var code = level.exerciseCode + ';return url;';
    var fn = Function('url', code);
    return fn(url);
  }
};
