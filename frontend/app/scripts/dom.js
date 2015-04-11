/* exported dom */
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
            el.innerHTML = '';
            append(el, children);
        },
        centerWindow: function () {
            window.scrollTo((document.documentElement.scrollWidth - document.documentElement.clientWidth) / 2, (document.documentElement.scrollHeight - document.documentElement.clientHeight) / 2);
        }
    };
})();
