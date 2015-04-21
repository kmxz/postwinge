/* exported thumbCutter */
/* global dom, rosetta */
var thumbCutter = (function () {
    'use strict';

    var AA_RATIO = 2;

    var ThumbContext = function () {
        this.canvas = dom.create('canvas', { 'width': rosetta.postGrossWidth.val * AA_RATIO, 'height': rosetta.postHeight.val * AA_RATIO });
        this.ctx = this.canvas.getContext('2d');

        var gradient = this.ctx.createLinearGradient(0, rosetta.postHeight.val * AA_RATIO, 0, 0);
        gradient.addColorStop(0, 'rgba(249,249,249,0.6)');
        gradient.addColorStop(0.2, 'rgba(249,249,249,0.4)');
        gradient.addColorStop(1, 'rgba(249,249,249,0.2)');
        this.ctx.fillStyle = gradient;
    };

    ThumbContext.prototype.clip = function () {
        this.ctx.beginPath();
        this.ctx.moveTo(rosetta.postWingWidth.val * AA_RATIO, 0);
        this.ctx.lineTo((rosetta.postGrossWidth.val - rosetta.postWingWidth.val) * AA_RATIO, 0);
        this.ctx.lineTo(rosetta.postGrossWidth.val * AA_RATIO, rosetta.postHeight.val / 2 * AA_RATIO);
        this.ctx.lineTo((rosetta.postGrossWidth.val - rosetta.postWingWidth.val) * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
        this.ctx.lineTo(rosetta.postWingWidth.val * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
        this.ctx.lineTo(0, rosetta.postHeight.val / 2 * AA_RATIO);
        this.ctx.closePath();
        this.ctx.clip();
    };

    ThumbContext.prototype.drawImg = function (img, callback) {
        this.ctx.clearRect(0, 0, rosetta.postGrossWidth.val * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
        this.ctx.drawImage(img, 0, 0);
        this.ctx.fillRect(0, 0, rosetta.postGrossWidth.val * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
        callback(this.canvas.toDataURL('image/png'));
    };

    var fullContext = new ThumbContext();
    var clipedContext = new ThumbContext();
    clipedContext.clip();

    return function (imgSrc, callback, clip) {
        var img = new Image();
        img.crossOrigin = 'Anonymous'; // FIXME for debug only
        img.addEventListener('load', function () {
            (clip ?  clipedContext : fullContext).drawImg(img, callback);
        });
        img.src = imgSrc;
    };
})();