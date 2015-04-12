/* exported dom */
/* global rosetta */
var dom = (function () {
    'use strict';

    var set = function (element, options) {
        var i, j, v;
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                v = options[i];
                if (i === 'style') {
                    for (j in v) {
                        if (v.hasOwnProperty(j)) {
                            element.style[j] = v[j];
                        }
                    }
                } else if (i === 'className') {
                    if (options.className instanceof Array) {
                        element.className = options.className.join(' ');
                    } else {
                        element.className = options.className;
                    }
                } else {
                    element.setAttribute(i, v);
                }
            }
        }
    };

    var append = function (element, children) {
        var add = function (child) {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            } else if (child) {
                element.appendChild(document.createTextNode(child));
            }
        };
        if (children instanceof Array) {
            children.forEach(add);
        } else {
            add(children);
        }
    };

    var easeInOutCubic = function (t) { // http://gizma.com/easing/
        t *= 2;
        if (t < 1) { return t * t * t / 2; }
        t -= 2;
        return (t * t * t + 2) / 2;
    };

    return {
        set: set,
        getParent: function (node, filter) {
            var cur = node;
            while (cur) {
                cur = cur.parentNode;
                if (filter(cur)) {
                    return cur;
                }
            }
            return null;
        },
        create: function (tag, options, opt_children) {
            var element = document.createElement(tag);
            if (options) {
                set(element, options);
            }
            if (opt_children) {
                append(element, opt_children);
            }
            return element;
        },
        put: function (el, children) {
            while (el.lastChild) {
                el.removeChild(el.lastChild);
            }
            append(el, children);
        },
        centerWindow: function () {
            window.scrollTo((document.documentElement.scrollWidth - document.documentElement.clientWidth) / 2, (document.documentElement.scrollHeight - document.documentElement.clientHeight) / 2);
        },
        scrollTo: function (x, y) {
            document.body.style.pointerEvents = 'none';
            var x0 = window.scrollX;
            var y0 = window.scrollY;
            var dx = x - x0; var dy = y - y0;
            var duration = rosetta.duration.val * 2 * 1000;
            var sTime = null;
            var anim = function (time) {
                if (!sTime) { sTime = time; }
                var prog = (time - sTime) / duration;
                if (prog > 1) {
                    prog = 1;
                }
                var correctedProg = easeInOutCubic(prog);
                window.scrollTo(correctedProg * dx + x0, correctedProg * dy + y0);
                if (prog < 1) {
                    window.requestAnimationFrame(anim);
                } else {
                    document.body.style.pointerEvents = 'auto';
                }
            };
            window.requestAnimationFrame(anim);
        }
    };
})();
