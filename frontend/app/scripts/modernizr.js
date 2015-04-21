(function () {
    'use strict';

    // feature detection copied from modernizr.js (with some modifications)
    var features = {
        'xhr2': function () { // https://gist.github.com/paulirish/1431660#file_xhr2.js
            var progEv = !!(window.ProgressEvent);
            var fdata = !!(window.FormData);
            var wCreds = window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest();
            return progEv && fdata && wCreds;
        },
        'classList': function () {
            return ('classList' in document.documentElement);
        },
        'es5Array': function () {
            return !!(Array.prototype && Array.prototype.every && Array.prototype.filter && Array.prototype.forEach && Array.prototype.indexOf && Array.prototype.lastIndexOf && Array.prototype.map && Array.prototype.some && Array.prototype.reduce && Array.prototype.reduceRight && Array.isArray);
        },
        'dragEvents': function () {
            var div = document.createElement('div');
            return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
        },
        'mouseEnterLeave': function () {
            var div = document.createElement('div');
            return ('onmouseenter' in div && 'onmouseleave' in div);
        },
        'transitionTransform': function () {
            var div = document.createElement('div');
            return ('transition' in div.style && 'transform' in div.style);
        },
        'cssCalc': function () {
            var div = document.createElement('div');
            div.style.cssText = 'width: calc(10px)';
            return !!div.style.length;
        },
        'cssGradient': function () {
            var div = document.createElement('div');
            div.style.backgroundImage = 'linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))';
            return div.style.backgroundImage.indexOf('gradient') >= 0;
        },
        'animationFrame': function () {
            return !!window.requestAnimationFrame;
        },
        'localStorage': function() {
            var mod = 'modernizr';
            try {
                localStorage.setItem(mod, mod);
                localStorage.removeItem(mod);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    var support = true;
    var i;
    for (i in features) {
        if (features.hasOwnProperty(i)) {
            if (!features[i]()) {
                support = false;
                break;
            }
        }
    }
    if (!support) {
        document.getElementById('warning').style.display = 'block';
    }
})();