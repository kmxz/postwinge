/* exported api */
var api = (function () {
    'use strict';

    var BACKEND_URL = 'http://grad.kmxz.net/php/'; // with trailing slash

    var actions = {
        // all revisions of a specific post
        'revisions': {method: 'get', url: 'list.php', params: ['post_id']},
        // all free posts
        'posts': {method: 'get', url: 'list.php'},
        // create a new post
        'create': {method: 'post', url: 'create.php', params: ['image', 'reply_to', 'x', 'y']},
        // update a post
        'update': {method: 'post', url: 'create.php', params: ['post_id', 'text_content']},
        // whoami
        'whoami': {method: 'post', url: 'whoami.php'}
    };
    return function (api, onsucess, opt_params, opt_onerror) {
        var config = actions[api];
        var url = config.url;
        var onerror = opt_onerror || function () {};
        var params = opt_params || [];
        var formData = null;
        var hasParam = config.params && config.params.length;
        if (hasParam) {
            config.params.forEach(function (key) {
                if (!(params.hasOwnProperty(key))) {
                    throw 'Parameter ' + key + ' not provided for ' + api + '.';
                }
            });
        }
        if (config.method === 'post') {
            if (!window.localStorage['key']) {
                alert('Please login to enjoy this feature.');
                return;
            }
            formData = new FormData();
            formData.append('key', window.localStorage['key']);
            if (hasParam) {
                config.params.forEach(function (key) {
                    formData.append(key, params[key]);
                });
            }
        } else if (config.method === 'get' && hasParam) {
            url += '?' + config.params.map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
        }
        var xhr = new XMLHttpRequest();
        xhr.open(config.method, BACKEND_URL + url);
        xhr.onload = function () {
            var res;
            if (xhr.status === 200) {
                try {
                    res = JSON.parse(xhr.responseText);
                } catch (_) {
                    window.alert('Server response parsing failed! Raw content: ' + xhr.responseText);
                    onerror();
                }
                if (res['success']) {
                    onsucess(res['data']);
                } else {
                    window.alert(res['data']);
                    onerror(res['data']);
                }
            } else {
                window.alert('The server rejected request. Status code: ' + xhr.status + '. Raw content: ' + xhr.responseText);
                onerror();
            }
        };
        xhr.onerror = function () {
            window.alert('Network error!');
            onerror();
        };
        xhr.send(formData);
    };
})();