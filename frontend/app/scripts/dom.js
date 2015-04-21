/* exported dom */
/* global utilities */
var dom = (function () {
    'use strict';

    var set = function (element, options) {
        utilities.forEach(options, function (v, i) {
            if (i === 'style') {
                utilities.forEach(v, function (vj, j) {
                    element.style[j] = vj;
                });
            } else if (i === 'className') {
                if (options.className instanceof Array) {
                    element.className = options.className.join(' ');
                } else {
                    element.className = options.className;
                }
            } else {
                element.setAttribute(i, v);
            }
        });
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

    var put = function (el, children) {
        while (el.lastChild) {
            el.removeChild(el.lastChild);
        }
        append(el, children);
    };

    // for autoResize
    var doppelganger = null;

    return {
        set: set,
        put: put,
        hasAncestor: function (el, ancestor) {
            var target = el;
            while (target) {
                if (target === ancestor) { return true; }
                target = target.parentNode;
            }
            return false;
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
        nl2p: function (str) {
            if (!str) { return null; }
            return str.split(/\r\n|\r|\n/).map(function (s) {
                var p = document.createElement('p');
                append(p, s);
                return p;
            });
        },
        autoResize: function (ta) {
            if (doppelganger) { document.body.removeChild(doppelganger); }
            doppelganger = ta.cloneNode(true);
            doppelganger.classList.add('doppelganger');
            doppelganger.style.width = ta.offsetWidth + 'px';
            document.body.appendChild(doppelganger);
            var resize = function () {
                put(doppelganger, ta.value);
                doppelganger.style.height = 100 + 'px';
                ta.style.height = doppelganger.scrollHeight + 'px';
            };
            ta.addEventListener('keydown', resize);
            ta.addEventListener('keyup', resize);
            ta.addEventListener('change', resize);
        },
        preventThen: function (realCallback) {
            return function (e) {
                e.stopPropagation();
                e.preventDefault();
                realCallback(e);
            };
        }
    };
})();
