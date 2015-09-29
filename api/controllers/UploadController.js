/**
 * UploadController
 *
 * @module      :: Controller
 * @description	:: Provides the actions upload new images from the admin interface
 */

module.exports = {
  /**
   * Only used for pinging
   * @param req
   * @param res
   */
  index: function (req, res) {

  },

  /**
   * Saves new image for testitem and updates testitems image path
   * @param req
   * @param res
   */
  test: function (req, res) {
    req.file('image').upload({
      dirname: '../../assets/images/test'
    }, function whenDone(err, uploadedFiles) {
      if(err)
        return res.negotiate(err);

      if(uploadedFiles.length === 0){
        return res.badRequest('No file was uploaded');
      }

      var fname = '';
      var fd = uploadedFiles[0].fd;
      for(var i = fd.length - 1; i > 0; i--){
        if(fd.charAt(i) === '/' || fd.charAt(i) === '\\'){
          fname = fd.substr(i + 1);
          break;
        }
      }

      FileService.copy('assets/images/test', '.tmp/public/images/test', fname);

      var id = req.allParams().id;
      TestItem.update({id: id}, {image: fname}).exec(function (err, testItem) {
        if(err) return res.forbidden({error: err});
        return res.json({});
      });
    });
  }
};
