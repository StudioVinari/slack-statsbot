var test = require('tape');

var sinon = require('sinon');
var requireSubvert = require('require-subvert')(__dirname);

var fakeClient = {
  login() {},
  on() {},
  joinChannel() {},
  getChannelByName() {}
};

test('Constructing a StatsBot starts a SlackClient and logs in', function(t) {
  t.plan(3);

  var sandbox = sinon.sandbox.create().stub(process, 'env', {'SLACK_TOKEN': 'atoken'});

  var client = fakeClient;
  var stub = sinon.stub().returns(client);
  requireSubvert.subvert('slack-client', stub);

  var mock = sinon.mock(client);
  mock.expects('login');

  var StatsBot = requireSubvert.require('../src/statsbot');
  var bot = new StatsBot();

  t.ok(stub.calledOnce, 'should call SlackClient constructor once');
  t.ok(stub.calledWith('atoken'), 'should construct SlackClient with environment variable token');

  t.ok(mock.verify(), 'should log in');

  sandbox.restore();
});

test('StatsBot joins #bot after login and stores the channel', function(t) {
  t.plan(5);

  var client = fakeClient;

  var joinSpy = sinon.spy(client, 'joinChannel');
  var getStub = sinon.stub(client, 'getChannelByName');
  var channel = 'channel';
  getStub.returns(channel);

  var StatsBot = require('../src/statsbot');
  var bot = new StatsBot(client);
  bot.loggedIn();

  t.ok(joinSpy.calledOnce, 'should call joinChannel');
  t.ok(joinSpy.calledWith('bot'), 'should join #bot');

  t.ok(getStub.calledOnce, 'should call getChannelByName');
  t.ok(getStub.calledWith('bot'), 'with bot');
  t.equal(bot.channel, channel, 'should save the channel');
});
