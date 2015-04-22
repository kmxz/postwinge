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

var channels = ['post', 'note'];

channels.forEach(function (type) {
  messages[type] = [];
});

var fuck = function (type, content) {
  if (content.type === 'remove') {
    // TODO
  }
}

try {
  var lines = fs.readFileSync(logFile, { encoding: 'utf8' }).split('\n').filter(function (line) { return line.trim().length; });
  lines.forEach(function (line) {
    var entry = JSON.parse(line);
    messages[entry.type].push(entry.content);
    fuck(entry.type, entry.content);
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
  info.req.channel = u.pathname.split('/')[1];
  cb(u && (channels.indexOf(info.req.channel) >= 0));
}});

wss.on('connection', function (ws) {
  ws.send(JSON.stringify(messages[ws.upgradeReq.channel].slice(-20))); // send last 20 to client
});

redis.on('message', function (channel, data) {
  log(channel, data);
  var parsed = JSON.parse(data);
  fuck(channel, data);
  messages[channel].push(parsed);
  if (messages.length > 40) { // keep 40 in memory
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
