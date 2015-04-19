/* exported api */
var api = (function () {
    'use strict';

    var SERVER = '//' + window.location.hostname;
    SERVER = '//grad.kmxz.net'; // debug OVERRIDE
    var BACKEND_URL = SERVER + '/php/'; // with trailing slash
    var IMAGE_URL = SERVER + '/upload/'; // with trailing slash
    var WEBSOCKET_URL = 'ws:' + SERVER + ':8080/'; // with trailing slash

    var actions = {
        // all revisions of a specific post
        'revisions': {method: 'get', url: 'list.php', params: ['post_id']},
        // all free posts
        'posts': {method: 'get', url: 'list_post.php'},
        // all notes
        'notes': {method: 'get', url: 'list_note.php'},
        // all target users for noting
        'targets': {method: 'get', url: 'list_target.php'},
        // create a new post
        'create': {method: 'post', url: 'create.php', params: ['x', 'y']},
        // upload an image
        'image': {method: 'post', url: 'image.php', params: ['post_id', 'image']},
        // update a post
        'update': {method: 'post', url: 'update.php', params: ['post_id', 'text_content']},
        // delete a post
        'remove': {method: 'post', url: 'remove.php', params: ['post_id']},
        // create a new note
        'noting': {method: 'post', url: 'noting.php', params: ['target_id', 'text_content', 'image', 'anonymous']},
        // whoami
        'whoami': {method: 'post', url: 'whoami.php'},
        // login
        'login': {method: 'get', url: 'login.php', params: ['token']}
    };
    return {
        request: function (api, onsucess, opt_params, opt_onerror) {
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
                if (!localStorage['postwingeSession']) {
                    window.alert('Please login to enjoy this feature.');
                    onerror();
                    return;
                }
                formData = new FormData();
                formData.append('key', localStorage['postwingeSession']);
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
                        return;
                    }
                    if (res['success']) {
                        onsucess(res['data']);
                    } else {
                        window.alert(res['data']);
                        onerror();
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
        },
        image: function (filename, thumb) {
            return IMAGE_URL + (thumb ? (filename.split('.', 1)[0] + '_thumb' + '.jpg') : filename) + '?FUCK_YOUR_MOTHER_ITSC&' + Math.random();
        },
        websockets: WEBSOCKET_URL
    };
})();