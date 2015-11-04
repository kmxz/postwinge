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


    Slot.prototype.newPost = function () {
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
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
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
    };

    Post.prototype.startEdit = function () {
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
    };

    Post.prototype.nonEmpty = function () {
        return this.image || this.revisionId;
    };

    Post.prototype.requestRemove = function (opt_success, opt_fail) {
        window.alert('Sorry, the project has stopped and the functionality is disabled.');
    };

    Post.prototype.remove = function () { // caution: strong assumption here: this post is totally empty
        this.slot.el.classList.add('empty');
        if (this.slot.popoutDummy) {
            this.slot.popoutDummy.classList.add('empty');
        }
        this.slot.post = null;
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
            });
            canvas.style.display = 'block';
            utilities.centerWindow();
        }
    };
})();