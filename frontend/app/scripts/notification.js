/* exported notification */
/* global api, dom */
var notification = (function () {
    'use strict';

    var currentHandlers = {};
    var ws = null;

    var getDay = function (date) {
        return Math.floor((date.getTime()  - date.getTimezoneOffset() * 60 * 1000) / (24 * 60 * 60 * 1000));
    };

    var zeroPad2 = function (num) {
        var str = num.toString();
        return (str.length === 1) ? ('0' + num) : str;
    };

    var readableTime = function (ts) {
        var date = new Date(ts * 1000);
        var now = new Date();
        if (getDay(date) !== getDay(now)) {
            return zeroPad2(date.getMonth() + 1) + '-' + zeroPad2(date.getDate());
        } else {
            return zeroPad2(date.getHours()) + ':' + zeroPad2(date.getMinutes());
        }
    };

    var ul = document.getElementById('activities');

    var direct = function (item) {
        currentHandlers[item['type']].render(item['data'], item['user_id'], item['display']);
    };

    window.addEventListener('beforeunload', function () {
       if (ws) {
           ws.close();
       }
    });

    return {
        startWebsockets: function (path, handlers) { // noticeL currently only support one ws connection
            currentHandlers = handlers;
            ws = new WebSocket(api.websockets + path);
            ws.onmessage = function (ev) {
                JSON.parse(ev.data).forEach(function (item) {
                    direct(item);
                    var msg = currentHandlers[item['type']].message;
                    if (msg) {
                        ul.insertBefore(dom.create('li', null, [
                            dom.create('span', {className: 'date'}, readableTime(item['time'])),
                            ' ',
                            item['display'] ? dom.create('span', {className: 'name'}, item['display']) : 'Anonymous user',
                            ' '
                        ].concat(msg(item['data']))), ul.firstChild);
                    }
                });
            };
        },
        fromSelf: direct
    };
})();