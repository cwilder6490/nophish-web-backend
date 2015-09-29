/**
 * LevelStatus
 *
 * @module      :: Model
 * @description :: Holds all level states of a user
 */

module.exports = {

  attributes: {

    level: {
      model: 'level'
    },

    user: {
      model: 'user'
    },

    unlocked: {
      type: 'boolean'
    },

    unlockedThroughPreTest: {
      type: 'boolean'
    },

    correctAnswers: {
      type: 'int'
    },

    remainingLives: {
      type: 'int'
    },

    score: {
      type: 'integer'
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;

      return obj;
    }
  },

  beforeCreate: function(values, cb){
    if(values.unlocked === undefined) values.unlocked = false;
    if(values.unlockedThroughPreTest === undefined) values.unlockedThroughPreTest = false;
    if(values.score === undefined) values.score = 0;
    if(values.remainingLives === undefined) values.remainingLives = 3;
    if(values.correctAnswers === undefined) values.correctAnswers = 0;
    cb();
  },

  beforeUpdate:function(values, cb){
    cb();
  }
};
