/* exported hack */
/* global mainPost, utilities */
var hack = (function () {
    'use strict';

    if (console) {
        console.log('If you want to hack this site, just run "hack()" in the console!');
    }
    return function () {
        [mainPost, mainNote].forEach(function (main) {
            utilities.forEach(main.posts, function (post) {
                post.image = 'ada7e33da0d8fd168f49337ba171f4cc.png';
                post.render();
            });
        });
    };
})();