<list-page>
    <header class="page">
        <h1>Puzzles</h1>
    </header>
    
    <section id="sources" class="list">
        <ul>
            <li each={ urlGens } onclick={ parent.setPuzzles }>{ title }</li>
        </ul>
    </section>
    
    <section id="dates" class="list">
        <ul>
            <li each={ puzzles } onclick={ parent.clickPuzzle }>{ title }
                <span if={ completion > 0 }>{ (completion*100).toFixed(0) + "%" }</span>
            </li>
        
            <div id="dates-notes" show={ puzzles.length == 0 }>
                <span>{ note }</span>
            </div>
        </ul>
    </section>

    <script>
        var self = this;
        self.mixin("display");
        
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
                var retval = [];
                for (var i=0; i<14; i++) {
                    if (!skip || skip.indexOf(date.getDay()) == -1)
                        retval.push({url: fn(date), title: date.toDateString()});
                    date.setDate(date.getDate() - 1);
                }
                return retval;
            }
        }

        function weekly(fn, day) {
            return function () {
                var date = new Date();
                var delta = day - date.getDay();
                var retval = [];
                if (delta > 0)
                    delta -= 7;
                date.setDate(date.getDate() + delta);
                for (var i=0; i<10; i++) {
                    retval.push({url: fn(date), title: date.toDateString()});
                    date.setDate(date.getDate() - 7);
                }
                return retval
            }
        }

        function fromList(list) {
            var retval = [];
            for (var i in list)
                retval.push({url: list[i]});
            return retval;
        }

        this.urlGens = [
            { title: "In Progress",
                func: function () {
                    self.note = "No puzzles in progress";
                    return fromList(database.getPuzzleUrls(false));
                }},
            { title: "Completed",
                func: function () {
                    self.note = "No completed puzzles";
                    return fromList(database.getPuzzleUrls(true));
                }},
            { title: "Washington Post",
                func: lastTwoWeeks(function (date) {
                    return "http://cdn.games.arkadiumhosted.com/washingtonpost/crossynergy/cs" +
                            sixDigitDate(date) + ".jpz";
                })},
            { title: "Washington Post Puzzler",
                func: weekly(function (date) {
                    return "http://cdn.games.arkadiumhosted.com/washingtonpost/puzzler/puzzle_" +
                            sixDigitDate(date) + ".xml";
                }, 0)},
            { title: "LA Times",
                func: lastTwoWeeks(function (date) {
                    return "http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la" +
                            sixDigitDate(date) + ".xml";
                })},
            { title: "USA Today",
                func: lastTwoWeeks(function (date) {
                    return "http://picayune.uclick.com/comics/usaon/data/usaon" +
                            sixDigitDate(date) + "-data.xml";
                })},
            { title: "Universal",
                func: lastTwoWeeks(function (date) {
                    return "http://picayune.uclick.com/comics/fcx/data/fcx" +
                            sixDigitDate(date) + "-data.xml";
                    })},
            { title: "Jonesin' Crosswords",
                func: weekly(function (date) {
                    return "http://picayune.uclick.com/comics/jnz/data/jnz" +
                            sixDigitDate(date) + "-data.xml";
                }, 2)},
            { title: "Wall Street Journal",
                func: weekly(function (date) {
                    return "http://blogs.wsj.com/applets/wsjxwd" + eightDigitDate(date) + ".dat";
                }, 5)},
            { title: "WSJ Greater New York",
                func: weekly(function (date) {
                    return "http://blogs.wsj.com/applets/gnyxwd" + strZero(date.getMonth() + 1) +
                            strZero(date.getDate()) + date.getFullYear() + ".dat";
                }, 1)},
            { title: "Thomas Joseph",
                func: lastTwoWeeks(function (date) {
                    return "http://puzzles.kingdigital.com/javacontent/clues/joseph/" +
                            eightDigitDate(date) + ".txt";
                }, [0])},
            { title: "Eugene Sheffer",
                func: lastTwoWeeks(function (date) {
                    return "http://puzzles.kingdigital.com/javacontent/clues/sheffer/" +
                            eightDigitDate(date) + ".txt";
                }, [0])},
            { title: "King Premier",
                func: weekly(function (date) {
                    return "http://puzzles.kingdigital.com/javacontent/clues/premier/" +
                            eightDigitDate(date) + ".txt";
                }, 0)}
        ];
        
        self.puzzles = [];
        self.note = "";
        
        setPuzzles(event) {
            var puzzles = event.item.func();
            for (var i in puzzles) {
                var stored = database.getPuzzle(puzzles[i]["url"]);
                if (stored) {
                    puzzles[i]["title"] = stored.puzzle.metadata["title"];
                    puzzles[i]["completion"] = stored.completion;
                } else {
                    puzzles[i]["completion"] = 0;
                }
            }
            self.puzzles = puzzles;
        }

        clickPuzzle(event) {
            riot.route("load/" + event.item.url);
        }


        /*function init() {
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

            dragScroll(document.querySelector("#sources"));
            dragScroll(document.querySelector("#dates"));
        }
        init();*/
    </script>
</list-page>
