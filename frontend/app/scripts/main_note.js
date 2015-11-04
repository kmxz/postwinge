/* exported mainNote */
/* global abstract, api, dom, login, notification, rosetta, utilities */
var mainNote = (function() {
    'use strict';

    var canvas = document.getElementById('canvas-note');
    var heads = document.getElementById('note-heads');
    var bodies = document.getElementById('note-bodies');
    var compose = document.getElementById('compose');
    var composeBtn = document.getElementById('compose-btn');
    var noteData = null;
    var loadedOne = false;
    var targets = {};
    var sortedTargets = null;
    var notes = {};

    var Target = function (id, token, display) {
        var displayEl = dom.create('div', { className: 'target-name' }, display);
        var tokenEl = dom.create('div', { className: 'target-token' }, token);
        this.targetId = id;
        this.head = dom.create('div', { className: 'target-head' }, [displayEl, tokenEl]);
        this.body = dom.create('div', { className: 'target' });
        this.token = token;
        this.tokenForFullMatch = token.toUpperCase().replace(/[^A-Z]/g, '');
        this.display = display;
        this.head.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.head.addEventListener('mouseleave', this.mouseleave.bind(this));
        this.head.addEventListener('click', this.click.bind(this));
        this.body.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.body.addEventListener('mouseleave', this.mouseleave.bind(this));
    };

    Target.prototype.render = function () {
        heads.appendChild(this.head);
        bodies.appendChild(this.body);
    };

    Target.prototype.mouseenter = function () {
        this.head.insertBefore(compose, this.head.lastChild);
    };

    Target.prototype.mouseleave = function () {
        if (compose.parentNode === this.head) {
            this.head.removeChild(compose);
        }
    };

    Target.prototype.click = function (e) {
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
    };

    Target.prototype.scrollTo = function () {
        var cbr = this.head.getBoundingClientRect();
        var left = cbr.left + window.pageXOffset;
        var top = cbr.top + window.pageYOffset;
        utilities.scrollTo(left, top);
    };

    var NoteSlot = function (target, note) {
        this.super();
        this.core = dom.create('div', { className: 'post-core' });
        this.el = dom.create('div', { className: 'note-single' }, [
            dom.create('div', { className: 'left-wing' }),
            dom.create('div', { className: 'right-wing' }),
            this.core
        ]);
        this.target = target;
        target.body.insertBefore(this.el, target.body.firstChild);
        this.post = note;
        this.listen();
    };

    utilities.inherits(NoteSlot, abstract.Slot);

    NoteSlot.prototype.isNotNote = false;

    NoteSlot.prototype.hijack = function (note) {
        note.slot.el.parentNode.removeChild(note.slot.el);
        this.post = note;
        note.slot = this;
        note.render(); // force re-render
    };

    var createFileUpload = function () {
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
    };

    NoteSlot.prototype.startEdit = function () {
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
    };

    var Note = function (noteId, textContent, image, datetime, targetId, display) {
        this.super(textContent, display, datetime, image);
        this.noteId = noteId;
        this.slot = new NoteSlot(targets[targetId], this);
    };

    utilities.inherits(Note, abstract.Post);

    var kel = document.getElementById('key-hint');
    var hintHint = document.getElementById('hint-hint');

    var keyFindInit = function () {
        var currentStr = '';
        var styleTimeout = null;
        var kore = null;
        var updateHint = function () {
            if (hintHint) {
                kel.removeChild(hintHint);
                hintHint = null;
            }
            var match = null;
            var isAtBeginning = false;
            sortedTargets.forEach(function (target) {
                if (!isAtBeginning) {
                    switch (target.tokenForFullMatch.indexOf(currentStr)) {
                        case -1: // does no contain at all
                            break;
                        case 0: // start with currentStr
                            match = target;
                            isAtBeginning = true;
                            break;
                        default: // contains currentStr in middle
                            if (!match) {
                                match = target;
                            }
                    }
                }
            });
            if (kore) {
                kel.removeChild(kore);
            }
            kore = dom.create('div', { className: match ? 'hint-core' : ['hint-core', 'not-found'] }, currentStr);
            kel.appendChild(kore);
            if (styleTimeout) {
                clearTimeout(styleTimeout);
            }
            styleTimeout = setTimeout(function () {
                kore.classList.add('killed');
                currentStr = '';
                if (match) {
                    match.scrollTo();
                }
            }, 1.5 * rosetta.duration.val * 1000);
        };
        document.documentElement.addEventListener('keydown', function (e) {
            if (document.getElementsByClassName('cloned').length) {
                return; // disable when notes popped-out
            }
            if (e.keyCode >= 65 && e.keyCode <= 90) { // a - z
                currentStr += String.fromCharCode(e.keyCode).toUpperCase();
            } else if (e.keyCode === 8 || e.keyCode === 46) { // backspace / delete
                currentStr = currentStr.substring(0, currentStr.length - 1);
            } else {
                return;
            }
            e.preventDefault();
            updateHint();
        });
    };

    var load = function () {
        if (!loadedOne) {
            loadedOne = true;
            return;
        }
        noteData.forEach(function (note) {
            notes[note['note_id']] = new Note(note['note_id'], note['text_content'], note['image'], note['datetime'], note['target_id'], note['display']);
            notes[note['note_id']].render();
        });
        utilities.randomScrollY();
        canvas.classList.add('loaded');
        hintHint.classList.add('killed');
        keyFindInit();
    };

    return {
        posts: notes,
        init: function () {
            document.getElementById('hint-hint-sidebar').style.display = 'block';
            api.request('targets', function (data) {
                data.forEach(function (target) {
                   targets[target['user_id']] = new Target(target['user_id'], target['index_name'], target['display']);
                });
                sortedTargets = utilities.sort(targets, function (t1, t2) {
                   return t1.token.localeCompare(t2.token);
                });
                sortedTargets.forEach(function (target) {
                   target.render();
                });
                load();
            });
            api.request('notes', function (data) {
                noteData = data;
                load();
            });
            canvas.style.display = 'block';
            kel.style.display = 'block';
            window.addEventListener('scroll', function () {
                heads.style.left = window.pageXOffset + 'px';
            });
        }
    };
})();