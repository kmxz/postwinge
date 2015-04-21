/* global mainPost, mainNote */
(function () { // use window.onload for compatibility concern
    'use strict';

    var post = document.getElementById('post-board');
    var note = document.getElementById('note-board');
    var baseUrl = '//' + window.location.host + window.location.pathname;

    switch (window.location.search) {
        case '?at':
            post.classList.remove('disabled');
            note.classList.remove('btn-default');
            note.classList.add('btn-primary');
            post.addEventListener('click', function () {
                window.location.replace(baseUrl);
            });
            mainNote.init();
            break;
        case '':
            note.classList.remove('disabled');
            post.classList.remove('btn-default');
            post.classList.add('btn-primary');
            note.addEventListener('click', function () {
                window.location.replace(baseUrl + '?at');
            });
            mainPost.init();
            break;
        default:
            window.location.replace(baseUrl);
    }
})();