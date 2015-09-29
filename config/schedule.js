module.exports.schedule = {
  sailsInContext : true,
  tasks : {
    email : {
      cron : "0 0 0,6,12,18 * * *",
      task : function (context, sails){
        console.log('---------------------');
        console.log('Cron Job running');
        UserService.sendReminderEmails();
      },
      context : {}
    },
    //test: {
    //  cron: '*/5 * * * * *',
    //  task: function (context, sails) {
    //    console.log('---------------------');
    //    console.log('Cron Job running');
    //    UserService.sendReminderEmails();
    //  },
    //  context: {}
    //}
  }
};
