/* exported mainPost */
/* global api, dom, login, nontification, rosetta, thumbCutter */
var mainPost = function() {
    'use strict';

    var canvas = document.getElementById('canvas-post');
    var edit = document.getElementsByClassName('edit')[0];
    var shed = document.getElementById('shed');

    canvas.style.display = 'block';

    var slots = [];
    var posts = {};

    var Slot = function (x, y) {
        this.x = x;
        this.y = y;
        this.core = dom.create('div', { className: 'post-core' });
        this.la =  dom.create('div', { className: 'left-arrow' });
        this.ra =  dom.create('div', { className: 'right-arrow' });
        this.el = dom.create('div', { className: ['post', 'empty'] }, [
            this.la, this.ra,
            dom.create('div', { className: 'post-proper' }, this.core),
        ]);
        this.postBgEl = null;
        this.popoutDummy = null;
        this.popoutExtended = null;
        this.inAnimation = false;
        this.popinScheduled = false;
        this.post = null;
        this.core.addEventListener('mouseenter', this.mouseenter.bind(this));
        this.core.addEventListener('mouseleave', this.mouseleave.bind(this));
        this.core.addEventListener('click', this.click.bind(this));
        canvas.appendChild(this.el);
    };

    Slot.prototype.click = function () {
        if (this.post) {
            if (this.post.userId === login.getUserId()) {
                this.popout(this.post.startEdit.bind(this.post));
            } else {
                this.popout(this.post.renderFull.bind(this.post));
            }
        } else {
            this.newPost();
        }
    };

    Slot.prototype.mouseenter = function () {
        this.el.classList.add('hover');
        if (this.post) {
            if (this.post.userId === login.getUserId()) {
                this.core.parentNode.appendChild(edit);
                edit.style.display = 'block';
            } else {
                // TODO
            }
        } else {
            this.core.parentNode.appendChild(edit);
            edit.style.display = 'block';
        }
    };

    Slot.prototype.mouseleave = function () {
        if (this.popoutDummy) { return; } // keep hover style! will auto remove when popin
        this.el.classList.remove('hover');
        edit.style.display = 'none';
    };

    Slot.prototype.newPost = function () {
        var success = false;
        var extended = false;
        api.request('create', function (data) {
            success = true;
            notification.fromSelf('create', data);
            if (extended) {
                this.post.startEdit();
            }
        }.bind(this), {
            'x': this.x,
            'y': this.y
        }, function () {
            this.popin();
        }.bind(this));
        this.popout(function () {
            if (success) {
                this.post.startEdit();
            } else {
                extended = true;
                dom.put(this.popoutExtended, dom.create('div', {className: ['alert alert-primary']}, 'Please wait...'));
            }
        }.bind(this));
    };

    var postProperWidth = (rosetta.postGrossWidth.val - 2 * rosetta.postWingWidth.val);

    Slot.prototype.setPopoutXToInitial = function (rect) {
        this.el.style.left = rect.left + 'px';
        this.el.style.width = postProperWidth + 'px';
    };

    Slot.prototype.setPopoutYToInitial = function (rect) {
        this.el.style.top = rect.top / document.documentElement.clientHeight * 100 + '%';
        this.el.style.height = rosetta.postHeight.val / document.documentElement.clientHeight * 100 + '%';
    };

    Slot.prototype.popout = function (callback) {
        if (this.popoutDummy) { return; } // already got one!
        this.inAnimation = true;
        this.popoutDummy = this.el.cloneNode(false);
        canvas.replaceChild(this.popoutDummy, this.el);
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
            window.popIn = this.popin.bind(this);
            this.popoutExtended.style.pointerEvents = 'auto';
            this.inAnimation = false;
            if (this.popinScheduled) {
                this.popin();
            }
        }.bind(this), rosetta.duration.val * 2000);
    };

    Slot.prototype.popin = function () {
        if (this.inAnimation) {
            this.popinScheduled = true; // if in popout animation, do popin when finished
            return;
        }
        this.inAnimation = true;
        this.popoutExtended.style.pointerEvents = 'none';
        var rect = this.popoutDummy.getBoundingClientRect();
        setTimeout(function () {
            this.el.classList.remove('animate-stage2');
            shed.classList.remove('shown');
            this.setPopoutYToInitial(rect);
        }.bind(this), 0);
        setTimeout(function () {
            this.el.classList.remove('animate-stage1');
            this.el.classList.remove('hover');
            this.popoutDummy.classList.remove('hover')
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
        }.bind(this), rosetta.duration.val * 2000);
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

    Slot.prototype.scrollToCenterOfScreen = function () {
        var left = parseInt(this.el.style.left);
        var top = parseInt(this.el.style.top);
        dom.scrollTo(left - document.documentElement.clientWidth / 2 + (rosetta.postGrossWidth.val - 2 * rosetta.postWingWidth.val) / 2, top - document.documentElement.clientHeight / 2 + rosetta.postHeight.val / 2);
    };

    var i, j;
    for (i = 0; i < rosetta.numOfPostsY.val; i++) {
        slots[i] = [];
        for (j = 0; j < rosetta.numOfPostsX.val; j++) {
            slots[i][j] = new Slot(j, i);
            slots[i][j].getLocationAndSet();
        }
    }

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
        var legal = function () { return el.scrollHeight <= rosetta.postHeight.val; }
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

    var Post = function (json) {
        this.postId = json['post_id'];
        this.userId = json['user_id'];
        this.textContent = json['text_content'];
        this.revisionId = json['revision_id'];
        this.display = json['display'];
        this.datetime = json['datetime'];
        this.image = json['image'];
        this.slot = slots[json['y_coord']][json['x_coord']];
        this.slot.el.classList.remove('empty');
        if (this.slot.popoutDummy) {
            this.slot.popoutDummy.classList.remove('empty');
        }
        posts[json['post_id']] = this;
        this.slot.post = this;
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

    var preventThen = function (realCallback) {
        return function (e) {
            e.stopPropagation();
            e.preventDefault();
            realCallback(e);
        };
    };

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
                notification.fromSelf('image', data);
            }, { 'post_id': instance.postId, 'image': file }, function () {
                setPb(pb1);
            });
        };
        input.addEventListener('change', function () {
            if (input.files.length === 1) {
                upload(input.files[0]);
            }
        });
        imgPanel.addEventListener('dragover', preventThen(function () {
            if (imgPanel.lastChild !== pb1) { return; }
            setPb(pb2);
        }));
        imgPanel.addEventListener('dragleave', preventThen(function () {
            if (imgPanel.lastChild !== pb2) { return; }
            setPb(pb1);
        }));
        imgPanel.addEventListener('drop', preventThen(function (e) {
            if (imgPanel.lastChild !== pb2) { return; }
            setPb(pb1);
            if (e.dataTransfer.files.length !== 1) {
                window.alert('Please add one and only one file!'); return;
            }
            upload(e.dataTransfer.files[0]);
        }));
        return imgPanel;
    };

    var autoResize = (function () {
        var doppelganger = null;
        return function (ta) {
            if (doppelganger) { document.body.removeChild(doppelganger); }
            doppelganger = ta.cloneNode(true);
            doppelganger.classList.add('doppelganger');
            doppelganger.style.width = ta.offsetWidth + 'px';
            document.body.appendChild(doppelganger);
            var resize = function () {
                dom.put(doppelganger, ta.value);
                doppelganger.style.height = 100 + 'px';
                ta.style.height = doppelganger.scrollHeight + 'px';
            };
            ta.addEventListener('keydown', resize);
            ta.addEventListener('keyup', resize);
            ta.addEventListener('change', resize);
        };
    })();

    Post.prototype.startEdit = function () {
        var ta = dom.create('textarea', { placeholder: 'Enter content here (optional)...', className: 'form-control' }, this.textContent);
        var cancelBtn = dom.create('button', { className: ['btn', 'btn-default'], type: 'button' }, 'Cancel');
        var saveBtn = dom.create('button', { className: ['btn', 'btn-primary'], type: 'button' }, 'Save');
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
        dom.put(this.slot.popoutExtended, [dom.create('form', null, dom.create('fieldset', null, [
            dom.create('legend', null, 'Edit post'),
            this.createFileUpload(),
            dom.create('div', { className: 'form-group' }, ta),
        ])), dom.create('div', { className: 'bottom-btns' }, [ cancelBtn, ' ', saveBtn ])]);
        cancelBtn.addEventListener('click', function () {
            if (window.confirm('Sure? All changes will be lost if you cancel.')) {
                this.slot.popin();
            }
        }.bind(this));
        saveBtn.addEventListener('click', function () {
            if (busy) { return; }
            var content = ta.value.trim();
            if (!content.length) { this.slot.popin(); return; }
            setBusy();
            api.request('update', function (data) {
                notification.fromSelf('update', data);
                this.slot.popin();
            }.bind(this), {
                'post_id': this.postId,
                'text_content': content
            }, unsetBusy);
        }.bind(this));
        autoResize(ta);
    };

    Post.prototype.renderFull = function () {
        var closeBtn = dom.create('button', { className: ['btn', 'btn-primary'], type: 'button' }, 'Close');
        closeBtn.addEventListener('click', function () {
            this.slot.popin();
        }.bind(this));
        dom.put(this.slot.popoutExtended, dom.create('form', null, dom.create('fieldset', null, [
            dom.create('legend', null, 'Post details'),
            dom.create('div', { className: ['panel', 'panel-default'] }, dom.create('div', { className: 'panel-body' }, [
                'This post is published by ',
                dom.create('span', { className: 'name' }, this.display),
                ' on ',
                this.datetime
            ])),
            dom.create('div', null, dom.nl2p(this.textContent)),
            dom.create('div', { className: 'bottom-btns' }, [ closeBtn ])
        ])));
    };

    dom.centerWindow();

    var excerpt = function (str) {
        return (str && str.length) ? (str.length <= 12 ? str : (str.substring(0, 10) + '...')) : 'a post';
    };

    var createPostnameSpan = function (data, content) {
        var span = dom.create('span', { className: 'postname' } , content);
        var id = data['post_id'];
        span.addEventListener('click', function () {
            posts[id].slot.scrollToCenterOfScreen();
        });
        return span;
    };

    notification.setHandlers({
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
                });
            },
            message: function (data) {
                return ['has created an ', createPostnameSpan(data, 'empty post'), '.'];
            }
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
                return ['has modified the post ', createPostnameSpan(data, excerpt(data['text_content'])), '.'];
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
                var post = posts[data['post_id']];
                return ['has upload a picture to ', createPostnameSpan(data, excerpt(post.textContent)), '.'];
            }
        }
    });

    api.request('posts', function (res) {
        res.forEach(function (post) {
            new Post(post).render();
        });
        canvas.classList.add('loaded');
        notification.startWebsockets('post');
    });
};