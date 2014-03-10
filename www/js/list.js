function initList(UI) {
    (function (self) {

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

        document.getElementById('open').addEventListener("click", function () {
            // http://cdn.games.arkadiumhosted.com/washingtonpost/crossynergy/cs140308.jpz
            loadJPZfile("file:///home/rschroll/touch/crosswords/test/cs140308.jpz");
        });

    })(window.puzzle = window.puzzle || {})
}
