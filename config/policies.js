/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  '*': false,

  'AuthController': {
    '*': true,
    'changePassword': ['hasJsonWebToken'],
    'deleteAccount': ['hasJsonWebToken'],
    'find': false,
    'create': false,
    'update': false,
    'delete': false
  },

  'UserController': {
    '*': true,
    'get': ['hasJsonWebToken'],
    'didPreTest': ['hasJsonWebToken'],
    'didPostTest': ['hasJsonWebToken'],
    'didRetentionTest': ['hasJsonWebToken'],
    'saveOptions': ['hasJsonWebToken'],
    'skippedPreTest': ['hasJsonWebToken'],
    'requestCertificate': ['hasJsonWebToken'],
    'requestConfirmEmail': ['hasJsonWebToken'],
    'confirmEmail': ['hasJsonWebToken'],
    'unlockRetentionTest': ['hasJsonWebToken'],
    'setRetentionTestRepeatDate': ['hasJsonWebToken'],
    'find': false,
    'create': false,
    'update': false,
    'delete': false
  },

  'PreTestController': {
    '*': true,
    'find': false,
    'create': false,
    'update': false,
    'delete': false,
    'finish': ['hasJsonWebToken']
  },

  TestController: {
    '*': true,
    'find': ['hasJsonWebToken'],
    'create': false,
    'update': false,
    'delete': false,
    'finishPostTest': ['hasJsonWebToken'],
    'finishRetentionTest': ['hasJsonWebToken']
  },

  'TestAnswerController': {
    '*': true,
    'find': false,
    'create': ['hasJsonWebToken'],
    'update': false,
    'delete': false
  },

  'DashboardController': {
    '*': ['hasJsonWebToken'],
    'find': ['hasJsonWebToken'],
    'create': false,
    'update': false,
    'delete': false
  },

  'LevelController': {
    '*': ['hasJsonWebToken'],
    'getLevel': ['hasJsonWebToken'],
    'finish': ['hasJsonWebToken'],
    'find': false,
    'create': false,
    'update': false,
    'delete': false
  },

  'AdminController': {
    '*': ['hasCorrectAdminPassword']
  },

  'UploadController': {
    '*': ['hasCorrectAdminPassword']
  },

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
