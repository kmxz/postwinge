/* exported mainNote */
/* global api, dom, utilities */
var mainNote = (function() {
    'use strict';

    var canvas = document.getElementById('canvas-note');
    var loadedOne = false;
    var targets = {};
    var notes = {};

    var load = function () {
        if (!loadedOne) {
            loadedOne = true;
            return;
        }
        utilities.forEach(targets, function (display, id) {
            var head = dom.create('div', { className: 'target-head' }, display);
            var el = dom.create('div', { className: 'target' }, [head]);
            targets[id] = {
                display: display,
                el: el
            };
        });
        canvas.style.display = 'block';
    };

    return {
        init: function () {
            api.request('targets', function (data) {
                data.forEach(function (target) {
                   targets[target['user_id']] = target['display'];
                });
                load();
            });
            api.request('notes', function (data) {
                data.forEach(function (note) {
                    notes[note['note_id']] = data;
                });
                load();
            });
        }
    };
})();