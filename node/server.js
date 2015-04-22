// read messages from Redis (sent by php), and forward to all clients via Websockets.
// each client will receive 25 previous messages on the beginning on connection.
// caution: this service should NOT be stopped as the results will be kept in memory w/o any persistence. nor will Redis keep a persisted record of messages.
// inspired by http://www.technology-ebay.de/the-teams/mobile-de/blog/connecting-php-and-node-with-redis-pub-sub-and-sockjs.html

var fs = require('fs');
var redis = require('redis').createClient();
var WebSocketServer = require('ws').Server;
var url = require('url');

var messages = {};

var logFile = __dirname + '/../log/node_united.log';
var logStream = fs.createWriteStream(logFile, { flags: 'a', encoding: 'utf8' });

var log = function (type, content) {
  logStream.write(JSON.stringify({ type: type, content: content }) + '\n');
  console.log(type + ' - ' + content);
};

var channels = ['post-create', 'post-update', 'note'];

channels.forEach(function (type) {
  messages[type] = [];
});

try {
  var lines = fs.readFileSync(logFile, { encoding: 'utf8' }).split('\n').filter(function (line) { return line.trim().length; });
  lines.forEach(function (line) {
    var entry = JSON.parse(line);
    messages[entry.type].push(entry.content); // FIXME check with previous ones!
  });
  console.log(lines.length + ' previous entries imported from log.');
} catch (e) {
  console.log('No previous log imported.');
}

channels.forEach(function (type) {
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
  log(channel, data); // FIXME check with previous ones
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
