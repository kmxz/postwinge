/* global dom, rosetta */
(function() {
    'use strict';

    var canvas = document.getElementsByClassName('canvas')[0];

    var slots = [];

    var Slot = function (x, y, textContent) {
        this.x = x;
        this.y = y;
        this.el = dom.create('div', { className: 'post' }, [
           dom.create('div', { className: 'left-arrow' }),
           dom.create('div', { className: 'post-proper' }, textContent),
           dom.create('div', { className: 'right-arrow' })
        ]);
        this.post = null;
        canvas.appendChild(this.el);
    };

    Slot.prototype.getLocationAndSet = function () {
        var left = rosetta.canvasPadding.val;
        left += (this.x * 2 + (this.y & 1)) * (rosetta.postGrossWidth.val - rosetta.postWingWidth.val + rosetta.postMarginX.val);
        var top = rosetta.canvasPadding.val;
        top += this.y / 2 * (rosetta.postHeight.val + rosetta.postMarginY.val);
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
    };

    Slot.prototype.getNeighbors = function () {
        var ret = [[this.x, this.y - 2], [this.x, this.y + 2], [this.x, this.y - 1], [this.x, this.y + 1], [this.x, this.y - 1], [this.x, this.y + 1]];
        var offset = (this.y & 1) ? 1 : -1;
        ret[4][0] += offset;
        ret[5][0] += offset;
        return ret.filter(function (coord) {
            return (coord[0] >= 0) && (coord[0] < rosetta.numOfPostsX.val) && (coord[1] >= 0) && (coord[1] < rosetta.numOfPostsY.val);
        }).map(function (coord) {
            return slots[coord[1]][coord[0]];
        });
    };

    var i, j;
    for (i = 0; i < rosetta.numOfPostsY.val; i++) {
        slots[i] = [];
        for (j = 0; j < rosetta.numOfPostsX.val; j++) {
            slots[i][j] = new Slot(j, i, '(' + j + ',' + i + ')');
            slots[i][j].getLocationAndSet();
        }
    }
})();