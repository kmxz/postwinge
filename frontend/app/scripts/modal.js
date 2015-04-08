/* exported Modal */
var Modal = (function () {
    'use strict';

    var Modal = function (id) {
        var instance = this;
        this.el = document.getElementById(id);
        var allButtons = this.el.getElementsByTagName('button');
        Array.prototype.slice.call(allButtons).filter(function (btn) {
            return btn.innerHTML === 'Close';
        }).forEach(function (btn) {
            btn.addEventListener('click', function () {
                instance.close();
            });
        });
    };
    Modal.prototype.open = function () {
        this.el.classList.add('shown');
    };
    Modal.prototype.close = function () {
        this.el.classList.remove('shown');
    };
    Modal.prototype.contentEl = function () {
        return this.el.getElementsByClassName('modal-body')[0];
    };
    return Modal;
})();