// read messages from Redis (sent by php), and forward to all clients via Websockets.
// each client will receive 20 previous messages on the beginning on connection.
// caution: this service should NOT be stopped as the results will be kept in memory w/o any persistence. nor will Redis keep a persisted record of messages.
// inspired by http://www.technology-ebay.de/the-teams/mobile-de/blog/connecting-php-and-node-with-redis-pub-sub-and-sockjs.html

var fs = require('fs');
var redis = require('redis').createClient();
var WebSocketServer = require('ws').Server;

var logFile = fs.createWriteStream(__dirname + '/../log/node.log', { flags: 'a' });

var log = function (content) {
  logFile.write(content + '\n');
  console.log(content);
};

var messages = [];
var wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function (ws) {
  ws.send(JSON.stringify(messages));
});

redis.subscribe('updates');
redis.on('message', function (channel, data) {
  log(data);
  messages.push(data);
  if (messages.length > 20) {
    messages.shift();
  }
  wss.clients.forEach(function (client) {
    client.send([data]);
  });
});
