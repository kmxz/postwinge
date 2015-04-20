/* exported mainNote */
/* global abstract, api, dom, utilities */
var mainNote = (function() {
    'use strict';

    var canvas = document.getElementById('canvas-note');
    var heads = document.getElementById('note-heads');
    var bodies = document.getElementById('note-bodies');
    var noteData = null;
    var loadedOne = false;
    var targets = {};
    var notes = {};

    var Target = function (token, display) {
        var displayEl = dom.create('div', { className: 'target-name' }, display);
        var tokenEl = dom.create('div', { className: 'target-token' }, token);
        this.head = dom.create('div', { className: 'target-head' }, [displayEl, tokenEl]);
        this.body = dom.create('div', { className: 'target' });
        this.display = display;
        heads.appendChild(this.head);
        bodies.appendChild(this.body);
    };

    var NoteSlot = function (note) {
        this.super();
        this.core = dom.create('div', { className: 'post-core' });
        this.el = dom.create('div', { className: 'note-single' }, this.core);
        note.target.body.insertBefore(this.el, note.target.body.firstChild);
        this.post = note;
        this.listen();
    };

    utilities.inherits(NoteSlot, abstract.Slot);

    var Note = function (noteId, textContent, image, datetime, targetId, display) {
        this.super(textContent, display, datetime, image);
        this.noteId = noteId;
        this.target = targets[targetId];
        this.slot = new NoteSlot(this);
    };

    utilities.inherits(Note, abstract.Post);

    var load = function () {
        if (!loadedOne) {
            loadedOne = true;
            return;
        }
        noteData.forEach(function (note) {
            notes[noteData['note_id']] = new Note(note['note_id'], note['text_content'], note['image'], note['datetime'], note['target_id'], note['display']);
            notes[noteData['note_id']].render();
        });
        //utilities.randomScrollY(); // FIXME this line is temporarily disabled for DEBUG ONLY
        canvas.classList.add('loaded');
    };

    return {
        posts: notes,
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