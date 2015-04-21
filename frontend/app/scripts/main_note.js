/* exported mainNote */
/* global abstract, api, dom, login, utilities */
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
    var notes = {};

    var Target = function (id, token, display) {
        var displayEl = dom.create('div', { className: 'target-name' }, display);
        var tokenEl = dom.create('div', { className: 'target-token' }, token);
        this.targetId = id;
        this.head = dom.create('div', { className: 'target-head' }, [displayEl, tokenEl]);
        this.body = dom.create('div', { className: 'target' });
        this.display = display;
        this.head.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.head.addEventListener('mouseleave', this.mouseleave.bind(this));
        this.head.addEventListener('click', this.click.bind(this));
        this.body.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.body.addEventListener('mouseleave', this.mouseleave.bind(this));
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
        if (!dom.hasAncestor(e.target, composeBtn)) {
            return;
        }
        if (!login.getUserId()) {
            window.alert('Please log in to enjoy this feature.');
            return;
        }
        /*
        * make a fake one with no ID, and do not put it into posts
        * user submit, if success, remove fake one before adding real one
        * user cancel, remove fake one
        * */
        var fakeSlot = new NoteSlot(this, null);
        fakeSlot.el.classList.add('hover');
        fakeSlot.popout(fakeSlot.startEdit.bind(fakeSlot));
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

    NoteSlot.prototype.shouldCut = false;

    NoteSlot.prototype.hijack = function (note) {
        note.slot.el.parentNode.removeChild(note.slot.el);
        this.post = note;
        note.slot = this;
        note.render(); // force re-render
    };

    var createFileUpload = function () {
        var fileToUpload = null;
        var input = dom.create('input', { type: 'file' });
        var pb1 = dom.create('div', { className: 'panel-body' }, [
            'Drag your image here directly, or ',
            input
        ]);
        var pb2 = dom.create('div', { className: 'panel-body' }, [
            'Just release your mouse here...'
        ]);
        var pb3 = dom.create('div', { className: 'panel-body' }, [
            'Image selected.'
        ]);
        var imgPanel = dom.create('div', { className: ['panel', 'panel-primary'] }, [
            dom.create('div', { className: 'panel-heading' }, dom.create('h3', { className: 'panel-title' }, 'Add a picture (optional)')),
            pb1
        ]);
        var setPb = function (pb) {
            imgPanel.replaceChild(pb, imgPanel.lastChild);
        };
        var check = function (file) {
            if (file.type.split('/', 1)[0] !== 'image') {
                window.alert('Please upload an image, not other types of file.');
                return;
            }
            setPb(pb3);
            fileToUpload = file;
            imgPanel.classList.remove('panel-primary');
            imgPanel.classList.add('panel-default');
        };
        input.addEventListener('change', function () {
            if (input.files.length === 1) {
                check(input.files[0]);
            }
        });
        imgPanel.addEventListener('dragover', dom.preventThen(function () {
            if (imgPanel.lastChild !== pb1) { return; }
            setPb(pb2);
        }));
        imgPanel.addEventListener('dragleave', dom.preventThen(function () {
            if (imgPanel.lastChild !== pb2) { return; }
            setPb(pb1);
        }));
        imgPanel.addEventListener('drop', dom.preventThen(function (e) {
            if (imgPanel.lastChild !== pb2) { return; }
            setPb(pb1);
            if (e.dataTransfer.files.length !== 1) {
                window.alert('Please add one and only one file!'); return;
            }
            check(e.dataTransfer.files[0]);
        }));
        return {
            el: imgPanel,
            getFile: function () {
                return fileToUpload;
            }
        };
    };

    NoteSlot.prototype.startEdit = function () {
        var ta = dom.create('textarea', { placeholder: 'Enter content here (required)...', className: 'form-control' }, this.textContent);
        var cancelBtn = dom.create('button', { className: ['btn', 'btn-default'], type: 'button' }, 'Cancel');
        var saveBtn = dom.create('button', { className: ['btn', 'btn-primary'], type: 'button' }, 'Post');
        var anonymous = dom.create('input', { type: 'checkbox' });
        // do not directly change "busy", use two functions below
        var busy = false;
        var setBusy = function () {
            busy = true;
            cancelBtn.classList.add('disabled');
            saveBtn.classList.add('disabled');
        };
        var unsetBusy = function () {
            busy = false;
            cancelBtn.classList.remove('disabled');
            saveBtn.classList.remove('disabled');
        };
        var imgUpload = createFileUpload();
        dom.put(this.popoutExtended, [dom.create('form', null, dom.create('fieldset', null, [
            dom.create('legend', null, 'Write a post to ' + this.target.display),
            imgUpload.el,
            dom.create('div', { className: 'form-group' }, ta),
            dom.create('div', { className: 'checkbox' }, dom.create('label', null, [
                anonymous,
                ' Post anonymously'
            ]))
        ])), dom.create('div', { className: 'bottom-btns' }, [ cancelBtn, ' ', saveBtn ])]);
        cancelBtn.addEventListener('click', function () {
            if (window.confirm('Sure? The content will be discarded if you do so.')) {
                this.popAbort();
            }
        }.bind(this));
        saveBtn.addEventListener('click', function () {
            if (busy) { return; }
            var content = ta.value.trim();
            setBusy();
            api.request('noting', function (data) {
                notification.fromSelf('create', data);
                this.hijack(notes[data['note_id']]);
                this.popin();
            }.bind(this), {
                'text_content': content,
                'image': imgUpload.getFile(),
                'target_id': this.target.targetId,
                'anonymous': anonymous.checked
            }, unsetBusy);
        }.bind(this));
        dom.autoResize(ta);
    };

    var Note = function (noteId, textContent, image, datetime, targetId, display) {
        this.super(textContent, display, datetime, image);
        this.noteId = noteId;
        this.slot = new NoteSlot(targets[targetId], this);
    };

    utilities.inherits(Note, abstract.Post);

    var load = function () {
        if (!loadedOne) {
            loadedOne = true;
            return;
        }
        noteData.forEach(function (note) {
            notes[note['note_id']] = new Note(note['note_id'], note['text_content'], note['image'], note['datetime'], note['target_id'], note['display']);
            notes[note['note_id']].render();
        });
        //utilities.randomScrollY(); // FIXME this line is temporarily disabled for DEBUG ONLY
        canvas.classList.add('loaded');
        notification.startWebsockets('note', {
            'create': {
                render: function (data, user_id, display) {
                    if (notes[data['note_id']]) {
                        return;
                    }
                    notes[data['note_id']] = new Note(data['note_id'], data['text_content'], data['image'], data['datetime'], data['target_id'], display);
                    notes[data['note_id']].render();
                },
                message: function (data) {
                    var post = notes[data['note_id']];
                    return ['posted to ', post.slot.target.display, (post.image ? 'with a picture' : null) ,': ', post.createPostnameSpan(post.excerpt()), '.'];
                }
            }
        });
    };

    return {
        posts: notes,
        init: function () {
            api.request('targets', function (data) {
                data.forEach(function (target) {
                   targets[target['user_id']] = new Target(target['user_id'], target['token'], target['display']);
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