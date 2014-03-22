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

        function lastTwoWeeks(fn) {
            return function () {
                var date = new Date();
                var retval = [];

                for (var i=0; i<14; i++) {
                    retval.push({ date: date.toDateString(), url: fn(date) });
                    date.setDate(date.getDate() - 1);
                }
                return retval;
            }
        }

        function weekly(fn, day) {
            return function () {
                var date = new Date();
                var retval = [];

                var delta = day - date.getDay();
                if (delta > 0)
                    delta -= 7;
                date.setDate(date.getDate() + delta);
                for (var i=0; i<10; i++) {
                    retval.push({ date: date.toDateString(), url: fn(date) });
                    date.setDate(date.getDate() - 7);
                }
                return retval;
            }
        }

        var urlGens = {
            "Washington Post": lastTwoWeeks(function (date) {
                return "http://cdn.games.arkadiumhosted.com/washingtonpost/crossynergy/cs" +
                        sixDigitDate(date) + ".jpz";
            }),
            "Washington Post Puzzler": weekly(function (date) {
                return "http://cdn.games.arkadiumhosted.com/washingtonpost/puzzler/puzzle_" +
                        sixDigitDate(date) + ".xml";
            }, 0),
            "LA Times": lastTwoWeeks(function (date) {
                return "http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la" +
                        sixDigitDate(date) + ".xml";
            }),
            "USA Today": lastTwoWeeks(function (date) {
                return "http://picayune.uclick.com/comics/usaon/data/usaon" +
                        sixDigitDate(date) + "-data.xml";
            }),
            "Universal": lastTwoWeeks(function (date) {
                return "http://picayune.uclick.com/comics/fcx/data/fcx" +
                        sixDigitDate(date) + "-data.xml";
            }),
            "Jonesin' Crosswords": weekly(function (date) {
                return "http://picayune.uclick.com/comics/jnz/data/jnz" +
                        sixDigitDate(date) + "-data.xml";
            }, 2)
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

        function appendDateNew(dates, dstr) {
            return function (url) {
                dates.append(dstr, "", null, clickPuzzle, url);
            }
        }

        function listSource(el, urlFn) {
            var dates = readyLists(el);
            var urls = urlFn();
            for (var i=0; i<urls.length; i++)
                database.getPuzzle(urls[i].url, appendDateSaved(dates), appendDateNew(dates, urls[i].date));
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
