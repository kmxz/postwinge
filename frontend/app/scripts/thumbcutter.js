/* exported thumbCutter */
/* globl dom, rosetta */
var thumbCutter = (function () {
    'use strict';

    var AA_RATIO = 2;
    var canvas = dom.create('canvas', { 'width': rosetta.postGrossWidth.val * AA_RATIO, 'height': rosetta.postHeight.val * AA_RATIO });
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(rosetta.postWingWidth.val * AA_RATIO, 0);
    ctx.lineTo((rosetta.postGrossWidth.val - rosetta.postWingWidth.val) * AA_RATIO, 0);
    ctx.lineTo(rosetta.postGrossWidth.val * AA_RATIO, rosetta.postHeight.val / 2 * AA_RATIO);
    ctx.lineTo((rosetta.postGrossWidth.val - rosetta.postWingWidth.val) * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
    ctx.lineTo(rosetta.postWingWidth.val * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
    ctx.lineTo(0, rosetta.postHeight.val / 2 * AA_RATIO);
    ctx.closePath();
    ctx.clip();

    var gradient = ctx.createLinearGradient(0, rosetta.postHeight.val * AA_RATIO, 0, 0);
    gradient.addColorStop(0, 'rgba(249,249,249,0.6)');
    gradient.addColorStop(0.2, 'rgba(249,249,249,0.4)');
    gradient.addColorStop(1, 'rgba(249,249,249,0.2)');
    ctx.fillStyle = gradient;

    return function (imgSrc, callback) {
        var img = new Image();
        img.crossOrigin = 'Anonymous'; // FIXME for debug only
        img.addEventListener('load', function () {
            console.log(img);
            ctx.clearRect(0, 0, rosetta.postGrossWidth.val * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
            ctx.drawImage(img, 0, 0);
            ctx.fillRect(0, 0, rosetta.postGrossWidth.val * AA_RATIO, rosetta.postHeight.val * AA_RATIO);
            callback(canvas.toDataURL('image/png'));
        });
        img.src = imgSrc;
    };
})();