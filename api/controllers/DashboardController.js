/**
 * DashboardController
 *
 * @module      :: Controller
 * @description	:: Provides the action to get the dashboard data
 */

module.exports = {
  /**
   * Returns the dashboard object
   * @param req
   * @param res
   */
  getDashboard: function (req, res) {
    var userId = req.session.user.id;

    LevelService.getDashboardLevels(userId, function (dashboardLevels) {
      var dashboard = {
        id: 1,
        preTestSkipped: req.session.user.preTestSkipped,
        levels: dashboardLevels
      };

      return res.json(dashboard);
    });
  }
};
