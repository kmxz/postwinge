/* exported AbstractPost */
/* global dom, rosetta, thumbCutter */

var AbstractPost = (function () {
    'use strict';

    var Post = function (textContent, display, datetime, image) {
        this.textContent = textContent;
        this.display = display;
        this.datetime = datetime;
        this.image = image;
        this.slot = null; // child class constructor should fill this
    };

    // binary search for maximum integer that satisfies an requirement, and call testFn for one last time using that number
    // lower: current maximum integer known to satisfy
    // upper: current minimum integer known NOT to satisfy
    // testFn: test function that returns true when satisfy
    var findMaximumAndSet = function (lower, upper, testFn) {
        var toTest;
        var l = lower, u = upper; // just for good practice, not changing parameters
        while (l + 1 < u) { // for performance reason, do not use recursion
            toTest = Math.floor((l + u) / 2);
            if (testFn(toTest)) {
                l = toTest;
            } else {
                u = toTest;
            }
        }
        testFn(l);
        return l;
    };

    var smartFont = function (el, content) {
        var p = dom.create('div', { className: 'text-content' }, content);
        var legal = function () { return el.scrollHeight <= rosetta.postHeight.val; };
        dom.put(el, p);
        var fs = findMaximumAndSet(13, 40, function (t) {
            p.style.fontSize = t + 'px';
            return legal();
        });
        if (fs > 13) {
            p.style.textAlign = 'center';
            return;
        }
        findMaximumAndSet(1, content.length, function (t) {
            dom.put(p, content.substring(0, t) + '...');
            return legal();
        });
    };

    var imageText = function (el, content) {
        var p = dom.create('div', { className: 'image-text' }, content);
        dom.put(el, p);
    };

    Post.prototype.render = function () {
        this.slot.core.style.display = 'block';
        if (this.image) {
            if (!this.slot.postBgEl) {
                this.slot.postBgEl = dom.create('div', { className: 'post-bg' });
            }
            this.slot.core.parentNode.insertBefore(this.slot.postBgEl, this.slot.core);
            thumbCutter(api.image(this.image, true), function (dataUrl) {
                this.slot.postBgEl.style.backgroundImage = 'url(\'' + dataUrl + '\')';
            }.bind(this));
            if (this.textContent && this.textContent.length) {
                imageText(this.slot.core, this.textContent);
            }
        } else {
            if (this.textContent && this.textContent.length) {
                this.slot.core.style.display = 'table';
                smartFont(this.slot.core, this.textContent);
            } else {
                dom.put(this.slot.core, null);
            }
        }
    };

    Post.prototype.renderFull = function () {
        var closeBtn = dom.create('button', { className: ['btn', 'btn-primary'], type: 'button' }, 'Close');
        closeBtn.addEventListener('click', function () {
            this.slot.popin();
        }.bind(this));
        var editBtn = null;
        if (this.userId === login.getUserId()) {
            editBtn = dom.create('button', { className: ['btn', 'btn-default'], type: 'button' }, 'Edit');
            editBtn.addEventListener('click', this.startEdit.bind(this));
        }
        var imgEl = null;
        if (this.image) {
            imgEl = dom.create('img', { className: 'content-img', src: api.image(this.image) });
            imgEl.addEventListener('click', function () {
                window.open(api.image(this.image));
            }.bind(this));
        }
        dom.put(this.slot.popoutExtended, dom.create('form', null, dom.create('fieldset', null, [
            dom.create('legend', null, 'Post details'),
            dom.create('div', { className: ['panel', 'panel-default'] }, dom.create('div', { className: 'panel-body' }, [
                'This post is published by ',
                dom.create('span', { className: 'name' }, this.display),
                ' on ',
                this.datetime
            ])),
            imgEl,
            dom.create('div', null, dom.nl2p(this.textContent)),
            dom.create('div', { className: 'bottom-btns' }, editBtn ? [ editBtn, ' ', closeBtn ] : closeBtn)
        ])));
    };

    Post.prototype.excerpt = function () {
        var str = this.textContent;
        return (str && str.length) ? (str.length <= 12 ? str : (str.substring(0, 10) + '...')) : 'a post';
    };

    Post.prototype.createPostnameSpan = function (content) {
        var span = dom.create('span', { className: 'postname' }, content);
        span.addEventListener('click', function () {
            this.slot.scrollToCenterOfScreen();
        }.bind(this));
        return span;
    };

    return Post;

})();