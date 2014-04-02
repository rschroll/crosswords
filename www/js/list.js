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

        function eightDigitDate(d) {
            return d.getFullYear() + strZero(d.getMonth() + 1) + strZero(d.getDate()) ;
        }

        function lastTwoWeeks(fn, skip) {
            return function () {
                var date = new Date();
                for (var i=0; i<14; i++) {
                    if (!skip || skip.indexOf(date.getDay()) == -1)
                        appendDate(fn(date), date.toDateString());
                    date.setDate(date.getDate() - 1);
                }
            }
        }

        function weekly(fn, day) {
            return function () {
                var date = new Date();
                var delta = day - date.getDay();
                if (delta > 0)
                    delta -= 7;
                date.setDate(date.getDate() + delta);
                for (var i=0; i<10; i++) {
                    appendDate(fn(date), date.toDateString());
                    date.setDate(date.getDate() - 7);
                }
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
            }, 2),
            "Wall Street Journal": weekly(function (date) {
                return "http://blogs.wsj.com/applets/wsjxwd" + eightDigitDate(date) + ".dat";
            }, 5),
            "WSJ Greater New York": weekly(function (date) {
                return "http://blogs.wsj.com/applets/gnyxwd" + strZero(date.getMonth() + 1) +
                        strZero(date.getDate()) + date.getFullYear() + ".dat";
            }, 1),
            "Thomas Joseph": lastTwoWeeks(function (date) {
                return "http://puzzles.kingdigital.com/javacontent/clues/joseph/" +
                        eightDigitDate(date) + ".txt";
            }, [0]),
            "Eugene Sheffer": lastTwoWeeks(function (date) {
                return "http://puzzles.kingdigital.com/javacontent/clues/sheffer/" +
                        eightDigitDate(date) + ".txt";
            }, [0]),
            "King Premier": weekly(function (date) {
                return "http://puzzles.kingdigital.com/javacontent/clues/premier/" +
                        eightDigitDate(date) + ".txt";
            }, 0),
            "New York Times Classics": function () {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "http://www.nytimes.com/svc/crosswords/v2/puzzles-for-section-front.json");
                xhr.responseType = "text";
                //xhr.withCredentials = true;

                function error(msg) {
                    noDates("Could not load puzzle list (" + msg + ")");
                }

                xhr.onreadystatechange = function(e) {
                    if (this.readyState != 4 )
                        return;

                    if (this.status != 200)
                        return error("Server status: " + this.status);

                    var resp = JSON.parse(this.response);
                    if (resp.status != "OK")
                        return error("JSON status: " + resp.status);

                    var puzzles = resp.results.free_puzzles[200].results;
                    for (var i=0; i<puzzles.length; i++) {
                        var date = new Date(puzzles[i].print_date);
                        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                        var url = "http://www.nytimes.com/svc/crosswords/v2/puzzle/daily-" +
                                    puzzles[i].print_date + ".json";
                        appendDate(url, date.toDateString());
                    }
                }
                xhr.send();
            }
        };

        function clickPuzzle(el, url) {
            puzzle.loadURL(url);
        }

        function readyLists(el) {
            UI.list("[id='dates']").removeAllItems();
            document.querySelector("#dates-notes").style.display = "none";

            var selected = document.querySelector("#sources .selected a");
            if (selected != el) {
                document.querySelector("#dates").scrollTop = 0;
                if (selected)
                    selected.parentElement.classList.remove("selected");
                el.parentElement.classList.add("selected");
            }
        }

        function appendDateSaved(url, puzzle, fill, completion) {
            var percent = (completion*100).toFixed(0) + "%";
            UI.list("[id='dates']").append(puzzle.metadata["title"], percent, null, clickPuzzle, url);
        }

        function appendDateNew(dstr) {
            return function (url) {
                UI.list("[id='dates']").append(dstr, "", null, clickPuzzle, url);
            }
        }

        function appendDate(url, dstr) {
            database.getPuzzle(url, appendDateSaved, appendDateNew(dstr));
        }

        function noDates(msg) {
            var notes = document.querySelector("#dates-notes");
            notes.style.display = "block";
            notes.children[0].textContent = msg;
        }

        function listSource(el, urlFn) {
            readyLists(el);
            urlFn();
        }

        function listSaved(el, solved) {
            readyLists(el);
            document.querySelector("#dates").scrollTop = 0;
            database.forEach(solved, appendDateSaved, noDates);
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
                    window.showOSK = false;
                    document.querySelector("#focuser").blur();
                } else {
                    window.showOSK = true;
                    document.querySelector("#focuser").focus();
                }
            });
        }
        init();

    })(window.puzzle = window.puzzle || {})
}
