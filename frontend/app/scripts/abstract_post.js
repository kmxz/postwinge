/* exported abstract */
/* global api, dom, login, rosetta, thumbCutter, utilities */

var abstract = (function () {
    'use strict';

    var edit = document.getElementsByClassName('edit')[0];
    var shed = document.getElementById('shed');

    var AbstractSlot = function () {
        this.el = null; // subtype constructor should fill this
        this.core = null; // subtype constructor should fill this
        this.postBgEl = null;
        this.popoutExtended = null;
        this.inAnimation = false;
        this.popoutDummy = null;
        this.post = null;
    };

    AbstractSlot.prototype.listen = function () {
        this.core.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.core.addEventListener('mouseleave', this.mouseleave.bind(this));
        this.core.addEventListener('click', this.click.bind(this));
    };

    var lastHighlight = null;

    AbstractSlot.prototype.scrollToCenterOfScreen = function () {
        var cbr = this.el.getBoundingClientRect();
        var left = cbr.left + window.scrollX;
        var top = cbr.top + window.scrollY;
        utilities.scrollTo(left - document.documentElement.clientWidth / 2 + (rosetta.postGrossWidth.val - 2 * rosetta.postWingWidth.val) / 2, top - document.documentElement.clientHeight / 2 + rosetta.postHeight.val / 2);
        if (lastHighlight) {
            lastHighlight.classList.remove('highlight');
        }
        setTimeout(function () {
            lastHighlight = this.el;
            this.el.classList.add('highlight');
        }.bind(this), 0);
    };

    AbstractSlot.prototype.click = function () {
        if (this.post) {
            this.popout(this.post.renderFull.bind(this.post));
        } else if (this.isNotNote) {
            this.newPost();
        }
    };

    AbstractSlot.prototype.mouseenter = function () {
        this.el.classList.add('hover');
        if (this.isNotNote && !this.post) {
            this.core.parentNode.appendChild(edit);
            edit.style.display = 'block';
        }
    };

    AbstractSlot.prototype.mouseleave = function () {
        if (this.popoutDummy) { return; } // keep hover style! will auto remove when popin
        this.el.classList.remove('hover');
        edit.style.display = 'none';
    };

    var postProperWidth = (rosetta.postGrossWidth.val - 2 * rosetta.postWingWidth.val);

    AbstractSlot.prototype.setPopoutXToInitial = function (rect) {
        this.el.style.left = rect.left + 'px';
        this.el.style.width = postProperWidth + 'px';
    };

    AbstractSlot.prototype.setPopoutYToInitial = function (rect) {
        this.el.style.top = rect.top / document.documentElement.clientHeight * 100 + '%';
        this.el.style.height = rosetta.postHeight.val / document.documentElement.clientHeight * 100 + '%';
    };

    AbstractSlot.prototype.popout = function (callback) {
        if (this.popoutDummy) { return; } // already got one!
        this.el.classList.remove('highlight'); // well, I don't know why, but this just solves the problem
        document.body.classList.add('modal-open');
        this.inAnimation = true;
        this.popoutDummy = this.el.cloneNode(false);
        this.el.parentNode.replaceChild(this.popoutDummy, this.el);
        this.popoutExtended = dom.create('div', { className: 'post-extended' });
        this.core.parentNode.appendChild(this.popoutExtended);
        var rect = this.popoutDummy.getBoundingClientRect();
        this.setPopoutXToInitial(rect);
        this.setPopoutYToInitial(rect);
        this.el.classList.add('cloned');
        this.popoutDummy.style.visibility = 'hidden'; // yes, we hide it
        document.body.appendChild(this.el);
        shed.style.display = 'block';
        setTimeout(function () {
            this.el.style.transition = rosetta.duration.val + 's';
            this.el.style.left = 'calc(50% - ' + rosetta.popRatio.val * postProperWidth / 2 + 'px)';
            this.el.style.width = rosetta.popRatio.val * postProperWidth + 'px';
            this.el.classList.remove('empty'); // just popped out one
            this.el.classList.add('animate-stage1');
            shed.classList.add('shown');
        }.bind(this), 0);
        setTimeout(function () {
            this.el.style.top = '12.5%';
            this.el.style.height = '75%';
            this.el.classList.add('animate-stage2');
            edit.style.display = 'none';
            callback();
        }.bind(this), rosetta.duration.val * 1000);
        setTimeout(function () {
            this.popoutExtended.style.pointerEvents = 'auto';
            this.inAnimation = false;
            if (this.popinScheduled) {
                this.popin();
            }
        }.bind(this), rosetta.duration.val * 2000);
    };

    AbstractSlot.prototype.popin = function () {
        if (this.inAnimation) {
            this.popinScheduled = true; // if in popout animation, do popin when finished
            return;
        }
        this.inAnimation = true;
        this.popoutExtended.style.pointerEvents = 'none';
        var rect = this.popoutDummy.getBoundingClientRect();
        this.el.classList.remove('animate-stage2');
        shed.classList.remove('shown');
        this.setPopoutYToInitial(rect);
        setTimeout(function () {
            this.el.classList.remove('animate-stage1');
            this.el.classList.remove('hover');
            this.popoutDummy.classList.remove('hover');
            this.setPopoutXToInitial(rect);
            this.popoutExtended.parentNode.removeChild(this.popoutExtended);
        }.bind(this), rosetta.duration.val * 1000);
        setTimeout(function () {
            shed.style.display = 'none';
            this.popoutDummy.style.visibility = 'visible';
            dom.put(this.popoutDummy, Array.prototype.slice.call(this.el.childNodes));
            document.body.removeChild(this.el);
            this.el = this.popoutDummy;
            this.popoutDummy = null;
            this.inAnimation = false;
            this.popinScheduled = false;
            this.popoutExtended = null;
            document.body.classList.remove('modal-open');
        }.bind(this), rosetta.duration.val * 2000);
    };

    AbstractSlot.prototype.popAbort = function () { // currently used by Note only
        this.inAnimation = true;
        this.popoutExtended.style.pointerEvents = 'none';
        this.popoutDummy.parentNode.removeChild(this.popoutDummy); // remove immediately
        this.el.classList.add('killed');
        shed.classList.remove('shown');
        setTimeout(function () {
            this.el.parentNode.removeChild(this.el);
            shed.style.display = 'none';
            document.body.classList.remove('modal-open');
        }.bind(this), rosetta.duration.val * 2000);
    };

    AbstractSlot.prototype.isNotNote = null; // warning: this should be overridden by children

    var AbstractPost = function (textContent, display, datetime, image) {
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

    AbstractPost.prototype.render = function () {
        this.slot.core.style.display = 'block';
        if (this.image) {
            if (!this.slot.postBgEl) {
                this.slot.postBgEl = dom.create('div', { className: 'post-bg' });
            }
            this.slot.core.parentNode.insertBefore(this.slot.postBgEl, this.slot.core);
            thumbCutter(api.image(this.image, true), function (dataUrl) {
                this.slot.postBgEl.style.backgroundImage = 'url(\'' + dataUrl + '\')';
            }.bind(this), this.slot.isNotNote);
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

    AbstractPost.prototype.renderFull = function () {
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
            dom.create('div', { className: ['panel', 'panel-default', 'max-80'] }, dom.create('div', { className: 'panel-body' }, [
                'This post is published by ',
                dom.create('span', { className: 'name' }, this.display || 'anonymous user'),
                ' on ',
                this.datetime
            ])),
            imgEl,
            dom.create('div', null, dom.nl2p(this.textContent)),
            dom.create('div', { className: 'bottom-btns' }, editBtn ? [ editBtn, ' ', closeBtn ] : closeBtn)
        ])));
    };

    AbstractPost.prototype.excerpt = function () {
        var str = this.textContent;
        return (str && str.length) ? (str.length <= 12 ? str : (str.substring(0, 10) + '...')) : 'a post';
    };

    AbstractPost.prototype.createPostnameSpan = function (content) {
        var span = dom.create('span', { className: 'postname' }, content);
        span.addEventListener('click', function () {
            this.slot.scrollToCenterOfScreen();
        }.bind(this));
        return span;
    };

    return {
        Post: AbstractPost,
        Slot: AbstractSlot
    };

})();