/**
 * TestAnswerController
 *
 * @module      :: Controller
 * @description	:: Provides the actions to get, finish and quick-unlock levels
 */

module.exports = {

  /**
   * Creates testanswer with given data
   * @param req
   * @param res
   */
  create: function (req, res) {
    var post = JSON.parse(JSON.stringify(req.body.testAnswer));
    delete post.id;

    TestAnswer.create(post).exec(function (err, testAnswer) {
      if(err) return res.json({error: err});

      var testAnswerEmber = testAnswer.toJSON();
      testAnswerEmber.id = req.body.testAnswer.id;
      return res.json({testAnswer: testAnswerEmber});
    });
  }
};
