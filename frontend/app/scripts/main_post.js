/* exported mainPost */
/* global abstract, api, dom, login, notification, rosetta, utilities */
var mainPost = (function () {
    'use strict';

    var canvas = document.getElementById('canvas-post');

    var slots = [];
    var posts = {};

    var Slot = function (x, y) {
        this.super();
        this.x = x;
        this.y = y;
        this.core = dom.create('div', { className: 'post-core' });
        this.el = dom.create('div', { className: ['post', 'empty'] }, [
            dom.create('div', { className: 'left-arrow' }),
            dom.create('div', { className: 'right-arrow' }),
            dom.create('div', { className: 'post-proper' }, this.core),
        ]);
        this.inAnimation = false;
        this.popinScheduled = false;
        this.listen();
        canvas.appendChild(this.el);
    };

    utilities.inherits(Slot, abstract.Slot);

    Slot.prototype.isNotNote = true;

    var getEmptyPost = function () {
        var emptyPost = null;
        utilities.forEach(posts, function (post) {
            if ((post.userId === login.getUserId()) && (!post.nonEmpty())) {
                emptyPost = post;
            }
        });
        return emptyPost;
    };

    Slot.prototype.newPost = function () {
        var emptyPost = getEmptyPost();
        if (emptyPost) {
            if (window.confirm('You cannot create a new post as you already have an empty post! Click OK if you want to delete the existing empty post and proceed with creating new post, or click Cancel if you want to jump to the existing empty post to finish it.')) {
                emptyPost.requestRemove(this.newPost.bind(this));
            } else {
                emptyPost.slot.scrollToCenterOfScreen();
            }
            return;
        }
        var success = false;
        var extended = false;
        this.popout(function () {
            if (success) {
                this.post.startEdit();
            } else {
                extended = true;
                dom.put(this.popoutExtended, dom.create('div', {className: ['alert alert-primary']}, 'Please wait...'));
            }
        }.bind(this));
        api.request('create', function (data) {
            success = true;
            notification.fromSelf(data);
            if (extended) {
                this.post.startEdit();
            }
        }.bind(this), {
            'x': this.x,
            'y': this.y
        }, this.popin.bind(this));
    };

    Slot.prototype.getLocationAndSet = function () {
        var left = rosetta.canvasPadding.val;
        left += (this.x * 2 + (this.y & 1)) * (rosetta.postGrossWidth.val - rosetta.postWingWidth.val + rosetta.postMarginX.val);
        left += rosetta.postWingWidth.val;
        var top = rosetta.canvasPadding.val;
        top += this.y / 2 * (rosetta.postHeight.val + rosetta.postMarginY.val);
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
    };

    var i, j;
    for (i = 0; i < rosetta.numOfPostsY.val; i++) {
        slots[i] = [];
        for (j = 0; j < rosetta.numOfPostsX.val; j++) {
            slots[i][j] = new Slot(j, i);
            slots[i][j].getLocationAndSet();
        }
    }

    var Post = function (json) {
        this.super(json['text_content'], json['display'], json['datetime'], json['image']);
        this.postId = json['post_id'];
        this.userId = json['user_id'];
        this.revisionId = json['revision_id'];
        this.slot = slots[json['y_coord']][json['x_coord']];
        this.slot.el.classList.remove('empty');
        if (this.slot.popoutDummy) {
            this.slot.popoutDummy.classList.remove('empty');
        }
        posts[json['post_id']] = this;
        this.slot.post = this;
    };

    utilities.inherits(Post, abstract.Post);

    Post.prototype.createFileUpload = function () {
        if (this.image) { return; } // don't init if we already have one image
        var instance = this;
        var input = dom.create('input', { type: 'file' });
        var pb1 = dom.create('div', { className: 'panel-body' }, [
            'Drag your image here directly, or ',
            input
        ]);
        var pb2 = dom.create('div', { className: 'panel-body' }, [
            'Just release your mouse here...'
        ]);
        var pb3 = dom.create('div', { className: 'panel-body' }, [
            'Your image is being uploaded now, please wait...'
        ]);
        var pb4 = dom.create('div', { className: 'panel-body' }, [
            'Image uploaded successfully.'
        ]);
        var imgPanel = dom.create('div', { className: ['panel', 'panel-primary'] }, [
            dom.create('div', { className: 'panel-heading' }, dom.create('h3', { className: 'panel-title' }, 'Add a picture (optional)')),
            pb1
        ]);
        var setPb = function (pb) {
            imgPanel.replaceChild(pb, imgPanel.lastChild);
        };
        var upload = function (file) {
            if (file.type.split('/', 1)[0] !== 'image') {
                window.alert('Please upload an image, not other types of file.');
                return;
            }
            setPb(pb3);
            api.request('image', function (data) {
                setPb(pb4);
                imgPanel.classList.remove('panel-primary');
                imgPanel.classList.add('panel-success');
                notification.fromSelf(data);
            }, { 'post_id': instance.postId, 'image': file }, function () {
                setPb(pb1);
            });
        };
        input.addEventListener('change', function () {
            if (input.files.length === 1) {
                upload(input.files[0]);
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
            upload(e.dataTransfer.files[0]);
        }));
        return imgPanel;
    };

    Post.prototype.startEdit = function () {
        var ta = dom.create('textarea', { placeholder: 'Enter content here (optional)...', className: 'form-control' }, this.textContent);
        var cancelBtn = dom.create('button', { className: ['btn', 'btn-default'], type: 'button' }, 'Discard changes');
        var saveBtn = dom.create('button', { className: ['btn', 'btn-primary'], type: 'button' }, 'Save changes');
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
        dom.put(this.slot.popoutExtended, [dom.create('form', null, [
            dom.create('h4', null, 'Edit post'),
            this.createFileUpload(),
            dom.create('div', { className: 'form-group' }, ta),
        ])]);
        dom.put(this.slot.bottomBtns, [ cancelBtn, ' ', saveBtn ]);
        cancelBtn.addEventListener('click', function () {
            if (window.confirm('Sure? ' + (this.nonEmpty() ? 'All changes will be lost' : 'The post will be deleted') + ' if you do so.')) {
                if (this.nonEmpty()) {
                    this.slot.popin();
                } else { // empty! we need to recycle the slot!
                    setBusy();
                    this.requestRemove(this.slot.popin.bind(this.slot), this.slot.popin.bind(this.slot));
                }
            }
        }.bind(this));
        saveBtn.addEventListener('click', function () {
            if (busy) { return; }
            var content = ta.value.trim();
            if (!content.length) { this.slot.popin(); return; }
            setBusy();
            api.request('update', function (data) {
                notification.fromSelf(data);
                this.slot.popin();
            }.bind(this), {
                'post_id': this.postId,
                'text_content': content
            }, unsetBusy);
        }.bind(this));
        dom.autoResize(ta);
    };

    Post.prototype.nonEmpty = function () {
        return this.image || this.revisionId;
    };

    Post.prototype.requestRemove = function (opt_success, opt_fail) {
        var success = opt_success || function () {};
        var fail = opt_fail || function () {};
        api.request('remove', function (data) {
            notification.fromSelf(data);
            success();
        }.bind(this), {
            'post_id': this.postId
        }, fail); // we just pop in, as it might be because that the user submitted a revision in another window
    };

    Post.prototype.remove = function () { // caution: strong assumption here: this post is totally empty
        this.slot.el.classList.add('empty');
        if (this.slot.popoutDummy) {
            this.slot.popoutDummy.classList.add('empty');
        }
        this.slot.post = null;
        this.slot = null;
        delete posts[this.postId];
    };

    return {
        posts: posts,
        init: function () {
            api.request('posts', function (res) {
                res.forEach(function (post) {
                    new Post(post).render();
                });
                canvas.classList.add('loaded');
                notification.startWebsockets('post', {
                    'create': {
                        render: function (data, user_id, display) {
                            var slot = slots[data['y_coord']][data['x_coord']];
                            if (slot.post) { // already one
                                return;
                            }
                            new Post({
                                'post_id': data['post_id'],
                                'user_id': user_id,
                                'display': display,
                                'datetime': null,
                                'image': null,
                                'revision_id': null,
                                'text_content': null,
                                'x_coord': data['x_coord'],
                                'y_coord': data['y_coord']
                            }); // no need to render as there is not content yet anyway
                        },
                        message: false
                    },
                    'update': {
                        render: function (data) {
                            var post = posts[data['post_id']];
                            if (!post) { return; } // sometimes the message arrive in wrong order. just ignore as such cases are rare
                            if (data['revision_id'] <= post.revisionId) { return; } // don't worry, null will be treated as 0 in comparison
                            post.revisionId = data['revision_id'];
                            post.datetime = data['datetime'];
                            post.textContent = data['text_content'];
                            post.render();
                        },
                        message: function (data) {
                            var post = posts[data['post_id']];
                            return [': ', post.createPostnameSpan(post.excerpt()), '.'];
                        }
                    },
                    'image': {
                        render: function (data) {
                            var post = posts[data['post_id']];
                            if (!post) { return; } // sometimes the message arrive in wrong order. just ignore as such cases are rare
                            post.image = data['image'];
                            post.render();
                        },
                        message: function (data) {
                            return ['uploaded ', posts[data['post_id']].createPostnameSpan('a picture'), ''];
                        }
                    },
                    'remove': {
                        render: function (data) {
                            var post = posts[data['post_id']];
                            if (!post) { return; } // maybe already deleted if it's done by the user
                            post.remove();
                        },
                        message: false
                    }
                });
            });
            canvas.style.display = 'block';
            utilities.centerWindow();
        }
    };
})();