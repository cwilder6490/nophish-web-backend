/**
 * Auth
 *
 * @module      :: Model
 * @description :: Holds all authentication methods for a User
 */

module.exports = {

  attributes: require('waterlock').models.auth.attributes({

    isThingsPassword: {
      type: 'boolean',
      required: true
    },

    thingsData: 'json',

    passwordResetToken: {
      type: 'string',
      defaultsTo: ''
    }
  }),

  beforeCreate: require('waterlock').models.auth.beforeCreate,
  beforeUpdate: require('waterlock').models.auth.beforeUpdate
};
