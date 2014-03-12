/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

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

        function clickPuzzle(el, url) {
            puzzle.loadURL(url);
        }

        function readyLists(el) {
            var dates = UI.list("[id='dates']");
            dates.removeAllItems();

            var selected = document.querySelector("#sources .selected a");
            if (selected != el) {
                document.querySelector("#dates").scrollTop = 0;
                if (selected)
                    selected.parentElement.classList.remove("selected");
                el.parentElement.classList.add("selected");
            }
            return dates;
        }

        function appendDateSaved(dates) {
            return function (url, puzzle, fill, completion) {
                var percent = (completion*100).toFixed(0) + "%";
                dates.append(puzzle.metadata["title"], percent, null, clickPuzzle, url);
            }
        }

        function appendDateNew(dates, d) {
            var dstr = d.toDateString();
            return function (url) {
                dates.append(dstr, "", null, clickPuzzle, url);
            }
        }

        function listSource(el, urlFn) {
            var dates = readyLists(el);
            var d = new Date();
            for (var i=0; i<14; i++) {
                database.getPuzzle(urlFn(d), appendDateSaved(dates), appendDateNew(dates, d));
                d.setDate(d.getDate() - 1);
            }
        }

        function listSaved(el, solved) {
            var dates = readyLists(el);
            dates.removeAllItems();
            document.querySelector("#dates").scrollTop = 0;
            database.forEach(solved, appendDateSaved(dates));
        }

        function init() {
            var sources = UI.list("[id='sources']");
            sources.append("In Progress", "", null, listSaved, false);
            sources.append("Completed", "", null, listSaved, true);

            var k = Object.keys(urlGens).sort();
            for (var i=0; i<k.length; i++)
                sources.append(k[i], "", null, listSource, urlGens[k[i]]);

            UI.pagestack.onPageChanged(function (e) {
                if (e.page == "list-page") {
                    var selected = document.querySelector("#sources .selected a");
                    if (selected)
                        selected.click();
                }
            });
        }
        init();

    })(window.puzzle = window.puzzle || {})
}
