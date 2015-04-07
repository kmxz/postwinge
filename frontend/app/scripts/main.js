/* global api, dom, rosetta */
(function() {
    'use strict';

    var canvas = document.getElementsByClassName('canvas')[0];

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
        this.proper.addEventListener('mouseenter', this.mouseenter.bind(this))
        canvas.appendChild(this.el);
    };

    Slot.prototype.mouseenter = function () {
        if (this.post) {
            if (this.post.userId === currentUserId) {

            } else {

            }
        } else {

        }
    };

    Slot.prototype.getLocationAndSet = function () {
        var left = rosetta.canvasPadding.val;
        left += (this.x * 2 + (this.y & 1)) * (rosetta.postGrossWidth.val - rosetta.postWingWidth.val + rosetta.postMarginX.val);
        var top = rosetta.canvasPadding.val;
        top += this.y / 2 * (rosetta.postHeight.val + rosetta.postMarginY.val);
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
    };

    Slot.prototype.getNeighbors = function () {
        var ret = [[this.x, this.y - 2], [this.x, this.y + 2], [this.x, this.y - 1], [this.x, this.y + 1], [this.x, this.y - 1], [this.x, this.y + 1]];
        var offset = (this.y & 1) ? 1 : -1;
        ret[4][0] += offset;
        ret[5][0] += offset;
        return ret.filter(function (coord) {
            return (coord[0] >= 0) && (coord[0] < rosetta.numOfPostsX.val) && (coord[1] >= 0) && (coord[1] < rosetta.numOfPostsY.val);
        }).map(function (coord) {
            return slots[coord[1]][coord[0]];
        });
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
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
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

    api('posts', function (res) {
        res.forEach(function (post) {
            var postObj = new Post(post);
            posts[post['post_id']] = postObj;
            postObj.render();
        });
    });
})();