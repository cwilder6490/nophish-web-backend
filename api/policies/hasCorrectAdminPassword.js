'use strict';
/* jshint unused:false */

/**
 * Checks if the password in the requests authorization header is valid
 * @param req
 * @param res
 * @param next
 */
module.exports = function(req, res, next) {
  var authHeader = req.headers['authorization'];
  var atob = require('atob');

  if(typeof(authHeader) === 'string' && atob(authHeader) === 'test'){
    next();
  }
  else{
    res.forbidden();
  }
};
