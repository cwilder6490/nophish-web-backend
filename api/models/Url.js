/**
 * Url
 *
 * @module      :: Model
 * @description :: Holds the attributes of an url
 */

module.exports = {

  attributes: {

    providerName: {
      type: 'string'
    },

    hasExtendedValidationCertificate: {
      type: 'boolean'
    },

    extendedValidationCertificateName: {
      type: 'string'
    },

    protocol: {
      type: 'string'
    },

    subDomains: {
      type: 'json'
    },

    domain: {
      type: 'string'
    },

    topLevelDomain: {
      type: 'string'
    },

    port: {
      type: 'string'
    },

    path: {
      type: 'json'
    },

    /**
     * Deletes sensible data
     * @returns {*}
     */
    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.id;

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
