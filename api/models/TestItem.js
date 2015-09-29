/**
 * TestItem
 *
 * @module      :: Model
 * @description :: Holds the attributes of a test question (item)
 */

module.exports = {

  attributes: {
    item_id: {
      type: 'integer',
      required: true
    },

    test: {
      model: 'test'
    },

    belongsToLevel: {
      model: 'level'
    },

    type: {
      type: 'string',
      enum: ['web', 'email'],
      required: true
    },

    provider: {
      type:  'string',
      required: true
    },

    isPhishing: {
      type: 'boolean',
      required: true
    },

    image: {
      type: 'string'
    },

    copyright: {
      type: 'string'
    },

    meta: {
      type: 'json'
    },

    /**
     * Returns an absolute path to the test-images
     * @returns {string}
     */
    getImagePath: function () {
      return '/images/test/';
    },

    /**
     * Deletes sensible data, stringify meta-data and inserts image-path
     * @returns {*}
     */
    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.item_id;
      delete obj.test;
      obj.imagePath = this.getImagePath();
      obj.meta = JSON.stringify(obj.meta);

      return obj;
    },

    /**
     * Deletes sensible data and inserts image-path
     * @returns {*}
     */
    toAdminJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.item_id;
      delete obj.test;
      obj.imagePath = this.getImagePath();

      obj.toJSON = function () {
        return this;
      };

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
