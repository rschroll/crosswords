function initList(UI) {
    (function (self) {

        function strZero(n) {
            if (n < 10)
                return "0" + n;
            return n.toString();
        }

        function sixDigitDate(d) {
            return strZero(d.getFullYear() % 100) + strZero(d.getMonth() + 1) + strZero(d.getDate());
        }

        var urlGens = {
            "Washington Post": function (date) {
                return "http://cdn.games.arkadiumhosted.com/washingtonpost/crossynergy/cs" +
                        sixDigitDate(date) + ".jpz";
            },
            "LA Times": function (date) {
                return "http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la" +
                        sixDigitDate(date) + ".xml";
            }
        };

        function loadJPZfile(url) {
            var fn = url.split("/").slice(-1)[0];
            var xhr = new XMLHttpRequest();
            var type = (fn.slice(-3) == "jpz") ? "arraybuffer" : "string";
            xhr.open("GET", url);
            xhr.responseType = type;

            xhr.onreadystatechange = function(e) {
                if (this.readyState == 4 ) {
                    if (this.status == 200) {
                        var parser = new DOMParser();
                        if (type == "arraybuffer") {
                            var zip = new JSZip(this.response);
                            var str = zip.file(fn).asText();
                        } else {
                            var str = this.response;
                        }
                        var doc = parser.parseFromString(str.replace("&nbsp;", " "), "text/xml");
                        puzzle.load(JPZtoJSON(doc));
                    } else {
                        console.log("Problems loading puzzle!")
                    }
                }
            }
            xhr.send();
        }

        function clickPuzzle(el, url) {
            loadJPZfile(url);
        }

        function listSource(el, urlFn) {
            var dates = UI.list("[id='dates']");
            dates.removeAllItems();
            var d = new Date();
            for (var i=0; i<14; i++) {
                dates.append(d.toDateString(), "", null, clickPuzzle, urlFn(d));
                d.setDate(d.getDate() - 1);
            }
        }

        function init() {
            var sources = UI.list("[id='sources']");
            var k = Object.keys(urlGens).sort();
            for (var i=0; i<k.length; i++)
                sources.append(k[i], "", null, listSource, urlGens[k[i]]);
        }
        init();

    })(window.puzzle = window.puzzle || {})
}
