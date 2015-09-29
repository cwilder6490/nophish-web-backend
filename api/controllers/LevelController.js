/**
 * LevelController
 *
 * @module      :: Controller
 * @description	:: Provides the actions to get, finish and quick-unlock levels
 */

/**
 * (Helper-function) Returns a randomized sub-array of array arr with size size
 * @param arr
 * @param size
 * @returns {Array.<T>|string|Blob|ArrayBuffer}
 */
function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

module.exports = {
  /**
   * Returns a level with meta-data and mutated urls
   * @param req
   * @param res
   */
  getLevel: function (req, res) {
    // TODO check for unlocked
    var id = req.param('id');
    LevelService.getAllLevels(function (levels) {
      var level = levels.filter(function (level) {
        return level.id === id;
      })[0];

      if(!level) return res.send(404);
      var userId = req.session.user.id;

      LevelStatus.findOrCreate({level: id, user: userId}).exec(function (err, levelStatus) {
        if(err) return res.forbidden({error: err});

        if(!level.info || level.info.length === 0){
          level.showInfo = false;
        }

        if(level.showExercise){
          Url.find().exec(function (err, urls) {
            var randomUrls = getRandomSubarray(urls, level.overallUrlNumber);

            var repeatedLevels = levels.filter(function (lvl) {
              return (lvl.position < level.position && lvl.position > 2);
            });

            var mutatedUrls = [];

            for(var i = 0; i < level.thisPhishUrlNumber; i++){
              mutatedUrls.push(LevelService.mutateUrl(level, randomUrls.shift()));
            }

            while(mutatedUrls.length < level.overallPhishesUrlNumber){
              if(repeatedLevels.length > 0){
                var lvl = repeatedLevels[Math.floor(Math.random() * repeatedLevels.length)];
                mutatedUrls.push(LevelService.mutateUrl(lvl, randomUrls.shift()));
              }
              else{
                mutatedUrls.push(randomUrls.shift());
              }
            }

            randomUrls.forEach(function (randomUrls) {
              mutatedUrls.push(randomUrls);
            });

            level.urls = getRandomSubarray(mutatedUrls, mutatedUrls.length);

            // backup urls
            var backupRandomUrls = getRandomSubarray(urls, (repeatedLevels.length + 2) * 3);
            var backupMutatedUrls = {};
            backupMutatedUrls[level.level_id] = [];
            backupMutatedUrls['notMutated'] = [];
            for(var i = 0; i < 3; i++){
              backupMutatedUrls[level.level_id].push(LevelService.mutateUrl(level, backupRandomUrls.shift()));
              backupMutatedUrls['notMutated'].push(backupRandomUrls.shift());
            }
            repeatedLevels.forEach(function (lvl) {
              backupMutatedUrls[lvl.level_id] = [];
              for(var i = 0; i < 3; i++){
                backupMutatedUrls[lvl.level_id].push(LevelService.mutateUrl(lvl, backupRandomUrls.shift()));
              }
            });

            level.backupUrls = backupMutatedUrls;

            return res.json(level);
          });
        }
        else{
          return res.json(level);
        }
      });

    });
  },

  /**
   * Finishes a level and returns the next level id if there is one or returns a success message and the updated user object
   * @param req
   * @param res
   */
  finish: function (req, res) {
    var id = req.param('id');
    var correctAnswers = req.param('correctAnswers');
    var score = req.param('score');
    var remainingLives = req.param('remainingLives');
    var userId = req.session.user.id;

    LevelService.getAllLevels(function (levels) {
      var level = levels.filter(function (level) {
        return level.id === id;
      })[0];

      LevelStatus.findOrCreate({level: level.id, user: userId}).exec(function (err, status) {
        if(err) return res.error({error: err});

        var currentStatusUpdate = {
          correctAnswers: correctAnswers,
          score: score,
          remainingLives: remainingLives
        };

        LevelStatus.update({id: status.id}, currentStatusUpdate).exec(function (err, status) {
          if(err) return res.error({error: err});

          var nextLevel = levels.filter(function (lvl) {
            return lvl.position > level.position;
          })[0];

          if(nextLevel === undefined){
            User.update({id: userId}, {postTestUnlocked: true}).exec(function (err, user) {
              if(err) return res.forbidden({error: err});

              return res.json({success: true, message: 'Spiel durchgespielt!', user: user[0]})
            });
          }
          else{
            LevelStatus.findOrCreate({level: nextLevel.id, user: userId}).exec(function (err, nextStatus) {
              if(err) return res.error({error: err});

              LevelStatus.update({id: nextStatus.id}, {unlocked: true}).exec(function (err, nextStatus) {
                if(err) return res.error({error: err});

                return res.json({nextLevelId: nextLevel.id});
              });
            });
          }
        });
      });
    });
  },

  /**
   * (Dev-action) Unlocks all levels for the current user
   * @param req
   * @param res
   * @returns {*}
   */
  unlockAll: function (req, res) {
    var userId = req.session.user.id;
    var pw = req.param('password');
    if(pw === 'dev'){
      LevelService.getAllLevels(function (levels) {
        var levelStateSearch = [];
        for (var j = 0; j < levels.length; j++) {
          levelStateSearch.push(
            {
              level: levels[j].id,
              user: userId
            }
          );
        }

        console.log(levelStateSearch);

        levelStateSearch.forEach(function (lvl) {
          LevelStatus.update(lvl, {unlocked: true}).exec(function (err, levelStates) {
            console.log('level');
          });
        });

        return res.json({});
      });
    }
    else{
      return res.forbidden({});
    }
  }
};
