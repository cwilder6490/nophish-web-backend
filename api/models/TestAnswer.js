/**
 * TestAnswer
 *
 * @module      :: Model
 * @description :: Holds the user given answer to a test question
 */

module.exports = {

  attributes: {
    test: {
      model: 'test',
      required: true
    },

    user: {
      model: 'user',
      required: true
    },

    doneAt: {
      type: 'date',
      required: true
    },

    question: {
      model: 'testItem',
      required: true
    },

    isPhishing: {
      type: 'boolean',
      required: true
    },

    argumentation: {
      type: 'string',
      defaultsTo: null
    },

    howSure: {
      type: 'integer',
      required: true
    },

    hasAccountAtProvider: {
      type: 'boolean',
      required: true
    },

    toJSON: function() {
      var obj = this.toObject();
      return obj;
    }
  },

  beforeCreate: function(values, cb){
    cb();
  },

  beforeUpdate:function(values, cb){
    cb();
  }
};
