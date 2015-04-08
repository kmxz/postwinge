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
        append: append,
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
        create: function (tag, options, children) {
            var element = document.createElement(tag);
            if (options) {
                set(element, options);
            }
            append(element, children);
            return element;
        },
        clear: function (el) {
            el.innerHTML = '';
        },
        centerWindow: function () {
            window.scrollTo((document.documentElement.scrollWidth - document.documentElement.clientWidth) / 2, (document.documentElement.scrollHeight - document.documentElement.clientHeight) / 2);
        },
        cloneToFixed: function (el) {
            var rect = el.getBoundingClientRect();
            var nel = el.cloneNode(true);
            nel.style.position = 'fixed';
            nel.style.left = rect.left;
            nel.style.top = rect.top;
            return nel;
        }
    };
})();
