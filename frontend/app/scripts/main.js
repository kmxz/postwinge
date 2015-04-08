/* global api, dom, login, rosetta */
(function() {
    'use strict';

    var canvas = document.getElementsByClassName('canvas')[0];
    var write = document.getElementById('write');

    var slots = [];

    var Slot = function (x, y) {
        this.x = x;
        this.y = y;
        this.proper = dom.create('div', { className: 'post-proper' });
        this.el = dom.create('div', { className: ['post', 'empty'] }, [
           dom.create('div', { className: 'left-arrow' }),
           this.proper,
           dom.create('div', { className: 'right-arrow' })
        ]);
        this.post = null;
        this.proper.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.proper.addEventListener('mouseleave', this.mouseleave.bind(this));
        canvas.appendChild(this.el);
    };

    Slot.prototype.mouseenter = function () {
        this.el.classList.add('hover');
        if (this.post) {
            if (this.post.userId === login.getUserId()) {

            } else {

            }
        } else {
            write.style.display = 'block';
            this.proper.appendChild(write);
        }
    };

    Slot.prototype.mouseleave = function () {
        this.el.classList.remove('hover');
        write.style.display = 'none';
    };

    Slot.prototype.getLocationAndSet = function () {
        var left = rosetta.canvasPadding.val;
        left += (this.x * 2 + (this.y & 1)) * (rosetta.postGrossWidth.val - rosetta.postWingWidth.val + rosetta.postMarginX.val);
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

    var smartFont = function (el, content) {
        var fs;
        dom.clear(el);
        dom.append(el, content);
        for (fs = 14; fs <= 38; fs++) {
            el.style.fontSize = fs + 'px';
            if (el.scrollHeight > el.offsetHeight) { break; }
        }
    };

    var posts = {};

    var Post = function (json) {
        this.postId = json['post_id'];
        this.userId = json['user_id'];
        this.textContent = json['text_content'];
        this.display = json['display'];
        this.datetime = json['datetime'];
        this.replyTo = json['reply_to'];
        this.x = json['x_coord'];
        this.y = json['y_coord'];
        this.image = json['image'];
        this.slot = slots[this.y][this.x];
        this.slot.post = this;
        this.slot.el.classList.remove('empty');
    };

    Post.prototype.render = function () {
        smartFont(this.slot.proper, this.textContent);
    };

    dom.centerWindow();

    api('posts', function (res) {
        res.forEach(function (post) {
            var postObj = new Post(post);
            posts[post['post_id']] = postObj;
            postObj.render();
        });
        canvas.classList.add('loaded');
    });
})();