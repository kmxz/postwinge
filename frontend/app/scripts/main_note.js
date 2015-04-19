/* exported mainNote */
/* global api, dom, utilities */
var mainNote = (function() {
    'use strict';

    var canvas = document.getElementById('canvas-note');
    var noteData = null;
    var loadedOne = false;
    var targets = {};
    var notes = {};

    var Target = function (token, display) {
        var displayEl = dom.create('div', { className: 'target-name' }, display);
        var tokenEl = dom.create('div', { className: 'target-token' }, token);
        var head = dom.create('div', { className: 'target-head' }, [displayEl, tokenEl]);
        var el = dom.create('div', { className: 'target' }, [head]);
        this.display = display;
        canvas.appendChild(el);
    };

    var Note = function (noteId, textContent, image, datetime, targetId, display) {
        this.noteId = noteId;
        this.target = targets[targetId];
        this.image = image;
        this.datetime = datetime;
        this.display = display;
        this.el = null;
        this.render();
    };

    Note.prototype.render = function () {
        if (this.el) { return; }
        this.el = document.createElement('dom', { className: 'note-single' });
        // similar render techiniques as "post"
    };

    var load = function () {
        if (!loadedOne) {
            loadedOne = true;
            return;
        }
        noteData.forEach(function (note) {
           notes[noteData['note_id']] = new Note(note['note_id'], note['text_content'], note['image'], note['datetime'], note['target_id'], note['display']);
        });
        utilities.randomScrollY();
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
                noteData = data;
                load();
            });
            canvas.style.display = 'block';
        }
    };
})();