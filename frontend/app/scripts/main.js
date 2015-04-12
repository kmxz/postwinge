/* global api, dom, login, rosetta, thumbCutter */
(function() {
    'use strict';

    var canvas = document.getElementsByClassName('canvas')[0];
    var compose = document.getElementsByClassName('write')[0];
    var edit = document.getElementsByClassName('edit')[0];
    var shed = document.getElementById('shed');

    var slots = [];

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
                this.popout(this.startEdit.bind(this));
            }
        } else {
            this.newPost();
        }
    };

    Slot.prototype.mouseenter = function () {
        this.el.classList.add('hover');
        if (this.post) {
            if (this.post.userId === login.getUserId()) {
                this.core.appendChild(edit);
                edit.style.display = 'block';
            } else {
                console.log(this.post.userId, login.getUserId());
            }
        } else {
            this.core.appendChild(compose);
            compose.style.display = 'block';
        }
    };

    Slot.prototype.mouseleave = function () {
        this.el.classList.remove('hover');
        compose.style.display = 'none';
        edit.style.display = 'none';
    };

    Slot.prototype.startEdit = function () {
        var ta = dom.create('textarea', { placeholder: 'Enter content here (optional)...', className: 'form-control' }, this.post.textContent);
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
        dom.put(this.popoutExtended, dom.create('form', null, dom.create('fieldset', null, [
            dom.create('legend', null, 'Edit post'),
            this.post.createFileUpload(),
            dom.create('div', { className: 'form-group' }, ta),
            dom.create('div', { className: 'form-group' }, [ cancelBtn, ' ', saveBtn ])
        ])));
        cancelBtn.addEventListener('click', function () {
            if (window.confirm('Sure? All changes will be lost if you cancel.')) {
                this.popin();
            }
        }.bind(this));
        saveBtn.addEventListener('click', function () {
            if (busy) { return; }
            var content = ta.value.trim();
            if (!content.length) { this.popin(); return; }
            setBusy();
            api.request('update', function () {
                this.post.textContent = content;
                this.post.render(); // re-render the post
                this.popin();
            }.bind(this), {
                'post_id': this.post.postId,
                'text_content': content
            }, unsetBusy);
        }.bind(this));
    };

    Slot.prototype.newPost = function () {
        var success = false;
        var extended = false;
        api.request('create', function (id) {
            success = true;
            posts[id] = new Post();
            posts[id].initAsNewPost(this, id);
            if (extended) {
                this.startEdit();
            }
        }.bind(this), {
            'x': this.x,
            'y': this.y
        }, function () {
            this.popin();
        }.bind(this));
        this.popout(function () {
            if (success) {
                this.startEdit();
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
            this.el.classList.remove('empty');
            this.el.classList.add('animate-stage1');
            shed.classList.add('shown');
        }.bind(this), 0);
        setTimeout(function () {
            this.el.style.top = '12.5%';
            this.el.style.height = '75%';
            this.el.classList.add('animate-stage2');
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
            console.log(this.popoutExtended);
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
    };

    var posts = {};

    var Post = function () {
        // user MUST call either initAsNewPost or initWithJson
    };

    Post.prototype.initAsNewPost = function (slot, id) {
        this.postId = id;
        this.userId = login.getUserId();
        this.textContent = null;
        this.display = login.getDisplay();
        this.datetime = null;
        this.image = null;
        this.slot = slot;
        this.slot.post = this;
        this.slot.el.classList.remove('empty');
    };

    Post.prototype.initWithJson = function (json) {
        this.postId = json['post_id'];
        this.userId = json['user_id'];
        this.textContent = json['text_content'];
        this.display = json['display'];
        this.datetime = json['datetime'];
        this.image = json['image'];
        this.slot = slots[json['y_coord']][json['x_coord']];
        this.slot.post = this;
        this.slot.el.classList.remove('empty');
    };

    Post.prototype.render = function () {
        this.slot.core.style.display = 'initial';
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
            api.request('image', function (img) {
                instance.image = img;
                setPb(pb4);
                imgPanel.classList.remove('panel-primary');
                imgPanel.classList.add('panel-success');
                instance.render(); // re-render the post
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

    dom.centerWindow();

    api.request('posts', function (res) {
        res.forEach(function (post) {
            var postObj = new Post();
            postObj.initWithJson(post);
            posts[post['post_id']] = postObj;
            postObj.render();
        });
        canvas.classList.add('loaded');
    });
})();