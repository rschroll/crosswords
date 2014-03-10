/**
 * Wait before the DOM has been loaded before initializing the Ubuntu UI layer
 */
window.onload = function () {
    var UI = new UbuntuUI();
    UI.init();
    initPuzzle(UI);

    function loadJPZfile(url) {
        var fn = url.split("/").slice(-1)[0];
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";

        xhr.onreadystatechange = function(e) {
            console.log(this.readyState + " " + this.status);
            if (this.readyState == 4 ) { //&& this.status == 200) {
                var zip = new JSZip(this.response);
                var parser = new DOMParser();
                var doc = parser.parseFromString(zip.file(fn).asText().replace("&nbsp;", " "), "text/xml");
                puzzle.load(JPZtoJSON(doc));
            }
        }
        xhr.send();
    }

    // http://cdn.games.arkadiumhosted.com/washingtonpost/crossynergy/cs140308.jpz
    loadJPZfile("file:///home/rschroll/touch/crosswords/test/cs140308.jpz");

    // Add an event listener that is pending on the initialization
    //  of the platform layer API, if it is being used.
    document.addEventListener("deviceready", function() {
        if (console && console.log)
            console.log('Platform layer API ready');
    }, false);
};
