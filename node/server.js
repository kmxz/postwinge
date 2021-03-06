// read messages from Redis (sent by php), and forward to all clients via Websockets.
// each client will receive 25 previous messages on the beginning on connection.
// caution: this service should NOT be stopped as the results will be kept in memory w/o any persistence. nor will Redis keep a persisted record of messages.
// inspired by http://www.technology-ebay.de/the-teams/mobile-de/blog/connecting-php-and-node-with-redis-pub-sub-and-sockjs.html

var fs = require('fs');
var redis = require('redis').createClient();
var WebSocketServer = require('ws').Server;
var url = require('url');

var log = {};
var messages = {};

['post-create', 'post-update', 'note'].forEach(function (type) {
  var logFile = __dirname + '/../log/node_' + type + '.log';
  var logStream = fs.createWriteStream(logFile, { flags: 'a', encoding: 'utf8' });
  log[type] = function (content) {
    logStream.write(content + '\n');
    console.log(content);
  };
  messages[type] = [];
  try {
    messages[type] = fs.readFileSync(logFile, { encoding: 'utf8' }).split('\n').filter(function (line) { return line.trim().length; }).slice(-25).map(function (line) { return JSON.parse(line); });
    console.log(type + ': ' + messages[type].length + ' previous entries imported from log.');
  } catch (e) {
    console.log(type + ': ' + 'No previous log imported.');
  }
  redis.subscribe(type);
});

var wss = new WebSocketServer({ port: 8080, verifyClient: function (info, cb) {
  var u = url.parse(info.req.url);
  switch (u.pathname.split('/')[1]) {
    case 'post':
      info.req.channels = ['post-create', 'post-update'];
      cb(true);
      break;
    case 'note':
      info.req.channels = ['note'];
      cb(true);
      break;
    default:
      cb(false);
  }
}});

wss.on('connection', function (ws) {
  ws.upgradeReq.channels.forEach(function (channel) {
    ws.send(JSON.stringify(messages[channel]));
  });
});

redis.on('message', function (channel, data) {
  log[channel](data);
  var parsed = JSON.parse(data);
  messages[channel].push(parsed);
  if (messages.length > 25) {
    messages.shift();
  }
  var legal = wss.clients.filter(function (client) {
    return client.upgradeReq.channels.indexOf(channel) >= 0;
  });
  legal.forEach(function (client) {
    client.send(JSON.stringify([parsed]));
  });
  console.log('forwarded to ' + legal.length + ' clients!');
});
