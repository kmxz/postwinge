(function () { // enable page dragging using mouse
    'use strict';

    var toggle = document.getElementById('dragToScrollToggle');
    var mouseDown = false;
    var baseX, baseY, baseEventX, baseEventY;
    var muteOnce = function (e) {
        if (Math.abs(baseX - window.scrollX) > 15 || Math.abs(baseY - window.scrollY) > 15) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.removeEventListener('click', muteOnce);
    };
    document.documentElement.addEventListener('mousedown', function (e) {
        if (!toggle.checked) { return; }
        mouseDown = true;
        baseEventX = e.pageX; baseEventY = e.pageY;
        baseX = window.scrollX; baseY = window.scrollY;
        e.target.addEventListener('click', muteOnce);
    });
    document.documentElement.addEventListener('mousemove', function (e) {
        if (document.body.classList.contains('modal-open')) {
            mouseDown = false;
        }
        if (!mouseDown) { return; }
        window.scrollTo(
            window.scrollX + baseEventX - e.pageX ,
            window.scrollY + baseEventY - e.pageY
        );
    });
    document.documentElement.addEventListener('mouseup', function () {
        mouseDown = false;
    });

    toggle.addEventListener('click', function () {
        if (toggle.checked) {
            localStorage.setItem('dragToScroll', true);
        } else {
            localStorage.removeItem('dragToScroll');
        }
    });

    if (localStorage.getItem('dragToScroll')) {
        toggle.checked = true;
    }
})();