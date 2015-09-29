/**
 * TokenService
 *
 * @module      :: Service
 * @description :: Provides methods for token generation
 */

module.exports = {
  /**
   * Creates new json web token for the user and returns it
   * @param req
   * @param res
   * @param user
   */
  getToken: function (req, res, user) {
    var jwtData = waterlock._utils.createJwt(req, res, user);

    var token = {};

    Jwt.create({token: jwtData.token, uses: 0, owner: user.id}).exec(function (err) {
      if (err) {
        return res.serverError('JSON web token could not be created');
      }

      var result = {};

      result[waterlock.config.jsonWebTokens.tokenProperty] = jwtData.token || 'token';
      result[waterlock.config.jsonWebTokens.expiresProperty] = jwtData.expires || 'expires';

      if (waterlock.config.jsonWebTokens.includeUserInJwtResponse) {
        result['user'] = user;
      }
      res.json(result);
    });
  }

};
