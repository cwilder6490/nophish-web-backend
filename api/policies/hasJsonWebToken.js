'use strict';
/* jshint unused:false */

/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Assumes that your request has an jwt;
 *
 */
module.exports = function(req, res, next) {
  var authHeader = req.headers['authorization'];
  if (authHeader === undefined || authHeader.substring(0,7) !== 'Bearer ') return res.forbidden('Authorization token not included in header');

  req.headers['access_token'] = authHeader.substring(7);
  waterlock.validator.validateTokenRequest(req, function(err, user){
    if(err){
      return res.forbidden(err);
    }

    // valid request
    next();
  });
};
