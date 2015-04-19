/* exported mainNote */
/* global api, dom, utilities */
var mainNote = (function() {
    'use strict';

    var canvas = document.getElementById('canvas-note');
    var loadedOne = false;
    var targets = {};
    var notes = {};

    var Target = function (token, display) {
        var head = dom.create('div', { className: 'target-head' }, display);
        var el = dom.create('div', { className: 'target' }, [head]);
        this.token = token;
        this.display = display;
        canvas.appendChild(el);
    };

    var load = function () {
        if (!loadedOne) {
            loadedOne = true;
            return;
        }
        canvas.classList.add('loaded');
    };

    return {
        init: function () {
            api.request('targets', function (data) {
                data.forEach(function (target) {
                   targets[target['user_id']] = new Target(target['token'], target['display']);
                });
                load();
            });
            api.request('notes', function (data) {
                data.forEach(function (note) {
                    notes[note['note_id']] = data;
                });
                load();
            });
            canvas.style.display = 'block';
        }
    };
})();