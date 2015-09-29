/**
 * FixtureService
 *
 * @module      :: Service
 * @description :: Provides methods to apply fixtures to the database
 */

var jsonfile = require('jsonfile');

/**
 * (Helper-Method) Checks if array a contains obj
 * @param a
 * @param obj
 * @returns {boolean}
 */
function contains(a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

/**
 * Inserts test and question fixtures into the database
 * @param fixtures
 * @param cb
 */
function insertTestFixtures(fixtures, cb){
  Test.findOrCreate({test_id: fixtures.test_id}, {test_id: fixtures.test_id}).populate('questions').exec(function (err, test) {
    if(err){
      console.log('Test creation failed! Error:', err);
    }
    else{
      TestItem.findOrCreate(
        fixtures.items.map(function(item){
          return {
            item_id: item.item_id,
            test: test.id
          };
        }),
        fixtures.items.map(function(item){
          item.test = test.id;
          return item;
        })
      ).exec(function (err, items) {
          if(err){
            console.log('TestItem creation failed! Error:', err);
          }
          else{
            Test.find({test_id: fixtures.test_id}).populate('questions').exec(function (err, test) {
              console.log('Test and Items migrated!');

              for(var i = 0; i < items.length; i++){
                var image = items[i].image;
                FileService.copy('assets/images/test', '.tmp/public/images/test', image, false);
              }

              if(cb) cb();
            });
          }
        });
    }
  });
}

/**
 * Links inserted test item fixtures to inserted level fixtures
 * @param links
 * @param test_id
 * @param cb
 */
function linkTestFixturesToLevelFixtures(links, test_id, cb){
  var linkedItems = {};
  var levelIds = [];
  for(var j = 0; j < links.length; j++){
    linkedItems[links[j].testItem] = false;
    if( ! contains(levelIds, links[j].level)){
      levelIds.push(links[j].level);
    }
  }

  for(var i = 0; i < levelIds.length; i++){
    var level_id = levelIds[i];

    Level.find({level_id: level_id}).exec(function (err, level) {
      if(err) console.log(err);

      level = level[0];
      if(level === undefined || level === null){
        console.log('Error: level not found');
        return;
      }

      for(var i = 0; i < links.length; i++){
        if(links[i].level === level.level_id){
          TestItem.update({item_id: links[i].testItem, test: test_id}, {belongsToLevel: level.id}).exec(function (err, item) {
            if(err) console.log(err);

            item = item[0];

            linkedItems[item.item_id] = true;

            if( Object.keys(linkedItems).every(function(el){return linkedItems[el] === true}) ){
              cb();
            }
          });
        }
      }
    });
  }
}

module.exports = {
  /**
   * Purges all authentication-related tables
   */
  purgeAuthentication: function () {
    Attempt.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged Attempt');});
    Auth.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged Auth');});
    Jwt.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged Jwt');});
    ResetToken.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged ResetToken');});
    Use.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged Use');});
    User.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged User');});
    TestAnswer.destroy().exec(function(err){if(err)console.log('Error', err);else console.log('Purged TestAnswer');});
  },

  /**
   * Applies level fixtures and purges the database before if purgeDatabase is true
   * @param purgeDatabase
   * @param cb
   */
  applyLevelsFixtures: function (purgeDatabase, cb) {
    function insertFixtures(cb){
      var file = 'fixtures/levels.json';
      jsonfile.readFile(file, function(err, obj) {
        if(err) console.log('Error: ', err);

        var levelIds = [];
        for(var i = 0; i < obj.length; i++){
          levelIds.push({level_id: obj[i]['level_id']});
        }

        Level.findOrCreate(levelIds,
          obj).exec(function (err, levels) {
            if(err)
              console.log('Level creation failed! Error:', err);

            console.log('Levels migrated!');
            if(cb) cb();
          });
      });
    }

    if(purgeDatabase){
      Level.destroy().exec(function (err) {
        console.log('Purged Levels');
        insertFixtures(cb);
      });
    }
    else{
      insertFixtures(cb);
    }
  },

  /**
   * Applies url fixtures and purges the database before if purgeDatabase is true
   * @param purgeDatabase
   * @param cb
   */
  applyUrlFixtures: function (purgeDatabase, cb) {
    function insertFixtures(cb){
      var file = 'fixtures/urls.json';
      jsonfile.readFile(file, function(err, obj) {
        if(err) console.log('Error: ', err);

        Url.create(obj).exec(function (err, levels) {
            if(err)
              console.log('URLs creation failed! Error:', err);

            console.log('URLs migrated!');
            if(cb) cb();
          });
      });
    }

    if(purgeDatabase){
      Url.destroy().exec(function (err) {
        console.log('Purged URLs');
        insertFixtures(cb);
      });
    }
    else{
      insertFixtures(cb);
    }
  },

  /**
   * Applies pretest fixtures and purges the database before if purgeDatabase is true
   * @param purgeDatabase
   * @param cb
   */
  applyPretestFixtures: function (purgeDatabase, cb) {
    if(purgeDatabase){
      TestItem.destroy().exec(function (err) {
        Test.destroy().exec(function (err) {
          console.log('Purged PreTests and PreTestItems');

          var file = 'fixtures/pretest.json';
          jsonfile.readFile(file, function(err, fixtures) {
            if (err) console.log('Error: ', err);

            insertTestFixtures(fixtures, cb);
          });
        });
      });
    }
    else{
      var file = 'fixtures/pretest.json';
      jsonfile.readFile(file, function(err, fixtures) {
        if (err) console.log('Error: ', err);

        insertTestFixtures(fixtures, cb);
      });
    }
  },

  /**
   * Applies posttest fixtures and purges the database before if purgeDatabase is true
   * @param purgeDatabase
   * @param cb
   */
  applyPosttestFixtures: function (purgeDatabase, cb) {
    if(purgeDatabase){
      TestItem.destroy().exec(function (err) {
        Test.destroy().exec(function (err) {
          console.log('Purged PostTests and PostTestItems');

          var file = 'fixtures/posttest.json';
          jsonfile.readFile(file, function(err, fixtures) {
            if (err) console.log('Error: ', err);

            insertTestFixtures(fixtures, cb);
          });
        });
      });
    }
    else{
      var file = 'fixtures/posttest.json';
      jsonfile.readFile(file, function(err, fixtures) {
        if (err) console.log('Error: ', err);

        insertTestFixtures(fixtures, cb);
      });
    }
  },

  /**
   * Applies retentiontest fixtures and purges the database before if purgeDatabase is true
   * @param purgeDatabase
   * @param cb
   */
  applyRetentiontestFixtures: function (purgeDatabase, cb) {
    if(purgeDatabase){
      TestItem.destroy().exec(function (err) {
        Test.destroy().exec(function (err) {
          console.log('Purged RetentionTests and RetentionTestItems');

          var file = 'fixtures/retentiontest.json';
          jsonfile.readFile(file, function(err, fixtures) {
            if (err) console.log('Error: ', err);

            insertTestFixtures(fixtures, cb);
          });
        });
      });
    }
    else{
      var file = 'fixtures/retentiontest.json';
      jsonfile.readFile(file, function(err, fixtures) {
        if (err) console.log('Error: ', err);

        insertTestFixtures(fixtures, cb);
      });
    }
  },

  /**
   * Links inserted pretest item fixtures to inserted level fixtures
   * @param cb
   */
  linkPretestFixturesToLevelFixtures: function (cb) {
    var file = 'fixtures/preTestItemToLevel.json';
    jsonfile.readFile(file, function(err, links) {
      if (err) console.log('Error: ', err);

      console.log('Linking Pretest');

      Test.findOne({test_id: 1}).exec(function (err, test) {
        return linkTestFixturesToLevelFixtures(links, test.id, cb);
      });
    });
  },

  /**
   * Links inserted posttest item fixtures to inserted level fixtures
   * @param cb
   */
  linkPosttestFixturesToLevelFixtures: function (cb) {
    var file = 'fixtures/postTestItemToLevel.json';
    jsonfile.readFile(file, function(err, links) {
      if (err) console.log('Error: ', err);

      console.log('Linking Posttest');

      Test.findOne({test_id: 2}).exec(function (err, test) {
        return linkTestFixturesToLevelFixtures(links, test.id, cb);
      });
    });
  },

  /**
   * Links inserted retentiontest item fixtures to inserted level fixtures
   * @param cb
   */
  linkRetentiontestFixturesToLevelFixtures: function (cb) {
    var file = 'fixtures/retentionTestItemToLevel.json';
    jsonfile.readFile(file, function(err, links) {
      if (err) console.log('Error: ', err);

      console.log('Linking Retentiontest');

      Test.findOne({test_id: 3}).exec(function (err, test) {
        return linkTestFixturesToLevelFixtures(links, test.id, cb);
      });
    });
  }
};
