/**
 * FileService
 *
 * @module      :: Service
 * @description :: Provides filesystem based operation methods
 */

var path = require('path');
var fsx = require('fs-extra');
var blobAdapter = require('skipper-disk')();

module.exports = {
  /**
   * Copys file from given source path to given destination and logs it if silence is true
   * @param srcDirpath
   * @param destDirpath
   * @param filename
   * @param silence
   */
  copy: function (srcDirpath, destDirpath, filename, silence) {
    fsx.copy(path.join(srcDirpath, filename), path.join(destDirpath, filename), {clobber: true}, function (err) {
      if (err) return console.error(err);
      if(silence !== true){
        console.log('Copy: ' + path.join(srcDirpath, filename) + ' ==> ' + path.join(destDirpath, filename));
      }
    });
  }
};
