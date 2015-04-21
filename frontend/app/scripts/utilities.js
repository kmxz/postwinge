/* exported utilities */
/* global rosetta */
var utilities = (function () {
    'use strict';

    // for scrollTo
    var easeInOutCubic = function (t) { // http://gizma.com/easing/
        t *= 2;
        if (t < 1) { return t * t * t / 2; }
        t -= 2;
        return (t * t * t + 2) / 2;
    };

    return {
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
        inherits: function(childCtor, parentCtor) { // modified from goog.inherits
            var TempCtor = function () {};
            TempCtor.prototype = parentCtor.prototype;
            childCtor.prototype = new TempCtor();
            childCtor.prototype.constructor = childCtor;
            childCtor.prototype.super = parentCtor.prototype.constructor;
        }
    };
})();