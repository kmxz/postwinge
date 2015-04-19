/* exported dom */
/* global rosetta, utilities */
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
        nl2p: function (str) {
            if (!str) { return null; }
            return str.split(/\r\n|\r|\n/).map(function (s) {
                var p = document.createElement('p');
                append(p, s);
                return p;
            });
        }
    };
})();
