/**
 * Level
 *
 * @module      :: Model
 * @description :: Holds all level attributes and meta-data
 */

module.exports = {

  attributes: {
    level_id: {
      type: 'string',
      required: true,
      unique: true
    },

    name: {
      type: 'string'
    },

    theme: {
      type: 'string'
    },

    description: {
      type: 'string'
    },

    isTrustLevel: {
      type: 'boolean'
    },

    showInfo: {
      type: 'boolean'
    },

    finishLevelButtonText: {
      type: 'string'
    },

    info: {
      type: 'json'
    },

    showExercise: {
      type: 'boolean'
    },

    onlySelectDomain: {
      type: 'boolean'
    },

    exerciseCode: {
      type: 'string'
    },

    overallUrlNumber: {
      type: 'integer',
      required: true,
      defaultsTo : 0
    },

    overallPhishesUrlNumber: {
      type: 'integer',
      required: true,
      defaultsTo : 0
    },

    thisPhishUrlNumber: {
      type: 'integer',
      required: true,
      defaultsTo : 0
    },

    position: {
      type: 'integer'
    },

    /**
     * Deletes sensible data
     * @returns {*}
     */
    toAdminJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;

      obj.toJSON = function () {
        return this;
      };

      return obj;
    },

    /**
     * Deletes sensible data
     * @returns {*}
     */
    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;

      return obj;
    }
  },

  /**
   * Sets default values if nothing is set and calls callback cb
   * @param values
   * @param cb
   */
  beforeCreate: function(values, cb){
    if(isNaN(parseInt(values.overallUrlNumber, 10)) || values.overallUrlNumber < 0){
      values.overallUrlNumber = 0;
    }
    if(isNaN(parseInt(values.overallPhishesUrlNumber, 10)) || values.overallPhishesUrlNumber < 0){
      values.overallPhishesUrlNumber = 0;
    }
    if(isNaN(parseInt(values.thisPhishUrlNumber, 10)) || values.thisPhishUrlNumber < 0){
      values.thisPhishUrlNumber = 0;
    }
    if( ! values.exerciseCode){
      values.exerciseCode = '';
    }
    if(values.isTrustLevel === undefined){
      values.isTrustLevel = false;
    }

    cb();
  },

  beforeUpdate:function(values, cb){
    cb();
  }
};
