(function () { // enable page dragging using mouse
    'use strict';

    var toggle = document.getElementById('dragToScrollToggle');
    var mouseDown = false;
    var baseX, baseY, baseEventX, baseEventY;
    var muteOnce = function (e) {
        var dx = baseX - window.pageXOffset;
        var dy = baseY - window.pageYOffset;
        if (dx * dx + dy * dy >= 100) { // for distance >= 10px, treat as drag, mute click
            e.preventDefault();
            e.stopPropagation();
        }
        this.removeEventListener('click', muteOnce);
    };
    document.documentElement.addEventListener('mousedown', function (e) {
        if (!toggle.checked) { return; }
        mouseDown = true;
        baseEventX = e.pageX; baseEventY = e.pageY;
        baseX = window.pageXOffset; baseY = window.pageYOffset;
        document.documentElement.addEventListener('click', muteOnce, true);
    });
    document.documentElement.addEventListener('mousemove', function (e) {
        if (document.body.classList.contains('modal-open')) {
            mouseDown = false;
        }
        if (!mouseDown) { return; }
        window.scrollTo(
            window.pageXOffset + baseEventX - e.pageX ,
            window.pageYOffset + baseEventY - e.pageY
        );
    });
    document.documentElement.addEventListener('mouseup', function () {
        mouseDown = false;
    });

    toggle.addEventListener('click', function () {
        if (toggle.checked) {
            localStorage.removeItem('dragToScrollDisabled');
        } else {
            localStorage.setItem('dragToScrollDisabled', true);
        }
    });

    if (!localStorage.getItem('dragToScrollDisabled')) {
        toggle.checked = true;
    }
})();