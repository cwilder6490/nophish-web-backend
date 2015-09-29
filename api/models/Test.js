/**
 * Test
 *
 * @module      :: Model
 * @description :: Holds the questions related to a test
 */

module.exports = {

  attributes: {
    test_id: {
      type: 'integer',
      defaultsTo: 1
    },

    questions: {
      collection: 'testItem',
      via: 'test'
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.test_id;

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
