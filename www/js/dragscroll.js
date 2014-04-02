/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

function dragScroll(element) {
    var hammer = Hammer(element, { prevent_default: false }),
        scrollStart = 0,
        maxScroll = 0;
    element.style.border = "0px solid #c9c9c9";

    hammer.on("dragstart", function (e) {
        scrollStart = element.scrollTop;
        maxScroll = element.scrollHeight - element.clientHeight;
        element.style.transition = element.style.webkitTransition = "";
    });
    hammer.on("drag", function (e) {
        var scrollTop = scrollStart - e.gesture.deltaY;
        element.scrollTop = scrollTop;
        element.style.borderTopWidth = (scrollTop < 0) ? -scrollTop + "px" : "0";
        element.style.borderBottomWidth = (scrollTop > maxScroll) ? (scrollTop - maxScroll) + "px" : "0";
    });
    hammer.on("dragend", function (e) {
        element.style.transition = element.style.webkitTransition = "border-width 0.25s";
        element.style.borderTopWidth = element.style.borderBottomWidth = "0";
    });
}
