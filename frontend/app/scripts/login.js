/* exported login */
/* global api, dom */
var login = (function () {
    'use strict';

    var iframe = null;
    var currentUserId = null;
    var currentDisplay = null;

    var login = document.getElementById('login');
    var userInfo = document.getElementById('user-info');

    var button = login.getElementsByTagName('button')[0];
    var a = login.getElementsByTagName('span')[0];
    var span = userInfo.getElementsByTagName('span')[0];

    var initInfo = function () {
        api('whoami', function (result) {
            currentUserId = result['user_id'];
            currentDisplay = result['display'];
            dom.put(span, currentDisplay);
            login.style.display = 'none';
            userInfo.style.display = 'block';
        });
    };

    button.addEventListener('click', function () {
        if (iframe) {
            iframe.parentNode.removeChild(iframe);
        }
        iframe = dom.create('iframe', { 'src': 'login.html', 'frameborder': 0 });
        document.body.appendChild(iframe);
    });

    a.addEventListener('click', function () {
        window.alert('Use your HKUST ITSC account to log in. Relax, we will not know your credentials. They\'ll be directly sent to ITSC servers via HTTPS, and we\'ll only know the authentication results. If you do not have an active ITSC account, email us to request for posting access.');
    });

    if (localStorage['postwingeSession']) {
        initInfo();
    } else {
        login.style.display = 'block';
    }

    return {
        login: function (token) {
            api('login', function (key) {
                if (key) {
                    localStorage['postwingeSession'] = key;
                    iframe.parentNode.removeChild(iframe);
                    initInfo();
                } else {
                    if (window.confirm('Seems that we haven\'t prepared an account for you yet. Would you like to sign up for one right now?')) {
                        window.open('https://docs.google.com/forms/d/1pQmfOBGru8nkKSf1bnU6zS6bWmNh5BsMPxx6ZH5p25Y/viewform?usp=send_form');
                    }
                }
            }, { 'token': token });
        },
        getUserId: function () {
            return currentUserId;
        },
        getDisplay: function () {
            return currentDisplay;
        }
    };
})();