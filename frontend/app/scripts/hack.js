/* exported hack */
/* global mainPost */
var hack = (function () {
    if (console) {
        console.log('If you want to hack this site, just run "hack()" in the console!');
    }
    return function () {
        var posts = mainPost.posts;
        var i;
        for (i in posts) {
            if (posts.hasOwnProperty(i)) {
                posts[i].image = 'ada7e33da0d8fd168f49337ba171f4cc.png';
                posts[i].render();
            }
        }
    };
})();