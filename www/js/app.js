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

    // Add an event listener that is pending on the initialization
    //  of the platform layer API, if it is being used.
    document.addEventListener("deviceready", function() {
        if (console && console.log)
            console.log('Platform layer API ready');
    }, false);
};
