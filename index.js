var conf = require('./config');

var StatsBot = require('./src/statsbot');
var SlackAdapter = require('./src/slack-adapter');

var UserRepository = require('./src/persistence/user-repository');
var ChannelRepository = require('./src/persistence/channel-repository');

var db = require('./models');

var SlackClient = require('slack-client');

var client = new SlackClient(conf.get('slackToken'));
var adapter = new SlackAdapter(client);

var userRepository = new UserRepository(db.User);
var channelRepository = new ChannelRepository(db.Channel);

var bot = new StatsBot(adapter, {userRepository, channelRepository}, {
  statsChannel: conf.get('statsChannel'),
  topUnknownsToQuery: conf.get('topUnknownsToQuery'),
  reportingThreshold: conf.get('reportingThreshold')
});


var reportingInterval = conf.get('reportingInterval');

var scheduler = require('./src/scheduler');

scheduler(reportingInterval, function() {
  bot.reportAllChannelStatistics();
});

module.exports = bot;
