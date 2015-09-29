/**
 * ThingsService
 *
 * @module      :: Service
 * @description :: Provides methods for the graphical password
 */

module.exports = {
  /**
   * Returns a standard image name by the number of the image
   * @param num
   * @returns {string}
   */
  getConvertedImageName: function(num){
      var size = sails.config.things.imagesPerCollection + '';
      var s = num + '';
      while (s.length <size.length) s = '0' + s;
      return s;
  }
};
