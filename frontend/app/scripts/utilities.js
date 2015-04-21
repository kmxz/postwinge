/* exported utilities */
/* global rosetta */
var utilities = (function () {
    'use strict';

    var easeInOutCubic = function (t) { // http://gizma.com/easing/
        t *= 2;
        if (t < 1) { return t * t * t / 2; }
        t -= 2;
        return (t * t * t + 2) / 2;
    };

    var clipScrollX = function (x) {
        if (x < 0) { return 0; }
        var maximumScrollable = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        return Math.min(x, maximumScrollable);
    };

    var clipScrollY = function (y) {
        if (y < 0) { return 0; }
        var maximumScrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return Math.min(y, maximumScrollable);
    };

    var x0, y0, dx, dy, sTime;
    var inScrollAnim = false;
    var duration = rosetta.duration.val * 2 * 1000;

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
            inScrollAnim = false;
            document.body.style.pointerEvents = 'auto';
        }
    };

    return {
        centerWindow: function () {
            window.scrollTo((document.documentElement.scrollWidth - document.documentElement.clientWidth) / 2, (document.documentElement.scrollHeight - document.documentElement.clientHeight) / 2);
        },
        scrollTo: function (x, y) {
            x0 = window.pageXOffset;
            y0 = window.pageYOffset;
            dx = clipScrollX(x) - x0;
            dy = clipScrollY(y) - y0;
            sTime = null;
            if (!inScrollAnim) {
                inScrollAnim = true;
                document.body.style.pointerEvents = 'none';
                window.requestAnimationFrame(anim);
            }
        },
        randomScrollY: function () {
            window.scrollTo(0, Math.random() * (document.documentElement.scrollHeight - document.documentElement.clientHeight));
        },
        forEach: function (object, callback) {
            var i;
            for (i in object) {
                if (object.hasOwnProperty(i)) {
                    callback(object[i], i);
                }
            }
        },
        sort: function (object, sorter) {
            var vals = Object.keys(object).map(function (key) {
                return object[key];
            });
            return vals.sort(sorter);
        },
        inherits: function(childCtor, parentCtor) { // modified from goog.inherits
            var TempCtor = function () {};
            TempCtor.prototype = parentCtor.prototype;
            childCtor.prototype = new TempCtor();
            childCtor.prototype.constructor = childCtor;
            childCtor.prototype.super = parentCtor.prototype.constructor;
        }
    };
})();