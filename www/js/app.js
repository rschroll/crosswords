/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

/**
 * Wait before the DOM has been loaded before initializing the Ubuntu UI layer
 */
window.onload = function () {
    var UI = new UbuntuUI();
    UI.init();
    initList(UI);
    initPuzzle(UI);

    document.querySelector("[data-role='pagestack']").style.top =
            document.querySelector("[data-role='header']").offsetHeight + 1 + "px";
    UI.pagestack.push("list-page");

    window.showOSK = false;
    document.querySelector("#focuser").addEventListener("blur", function (e) {
        if (window.showOSK)
            e.target.focus();
    });

    // Fix back button in toolbar
    var backs = document.querySelectorAll("[data-role='back']");
    for (var i=0; i<backs.length; i++)
        UI.button(backs[i].id).click(function (e) {
            // This fires after existing handler (if it is triggered), so this will
            // cause problems if we ever get more than two pages in the stack.
            if (UI.pagestack.depth() > 1)
                UI.pagestack.pop();
        });

    // Add an event listener that is pending on the initialization
    //  of the platform layer API, if it is being used.
    document.addEventListener("deviceready", function() {
        if (console && console.log)
            console.log('Platform layer API ready');
    }, false);
};
