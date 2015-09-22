/* Copyright 2014-2015 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */
<list-page>
    <header class="page">
        <h1>Puzzles</h1>
        <ul class="actions">
            <li if={ deleteMode } onclick={ disableDelete }>
                <img src="img/cancel.svg" alt="Cancel" title="Cancel" />
                <span>Delete</span>
            </li>
            <li if={ deleteMode } onclick={ deletePuzzles }>
                <img src="img/delete-red.svg" alt="Delete" title="Delete" />
                <span>Delete</span>
            </li>
            <li onclick={ enableDelete }
                if={ !deleteMode &&  puzzles.length &&
                    (selected == 'Empty' || selected == 'In Progress' || selected == 'Completed') }>
                <img src="img/delete.svg" alt="Delete" title="Delete" />
                <span>Delete</span>
            </li>
            <li if={ !deleteMode } onclick={ about }>
                <img src="img/info.svg" alt="About" title="About" />
                <span>About</span>
            </li>
        </ul>
    </header>
    
    <section id="sources" class={ list: true, deleteMode: deleteMode }>
        <ul>
            <li each={ urlGens } class={ selected: parent.selected == title } onclick={ parent.setPuzzles }>
                { title }
                <span if={ parent.deleteMode && parent.selected == title }>
                    <input type="checkbox" onclick={ parent.setPuzzlesInput }/>
                </span>
            </li>
            <li onclick={ getFile }>Import File</li>
        </ul>
         <input type="file" id="fileinput" onchange={ loadFile } />
    </section>
    
    <section id="dates" class={ list: true, deleteMode: deleteMode } show={ selected }>
        <ul>
            <li each={ puzzles } onclick={ parent.clickPuzzle }>{ title }
                <span if={ !parent.deleteMode && completion > 0 }>{ (completion*100).toFixed(0) + "%" }</span>
                <span if={ parent.deleteMode }>
                    <input type="checkbox" url={ url } onclick={ parent.clickPuzzleInput } />
                </span>
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
            { title: "Empty",
                func: function () {
                    self.note = "No empty puzzles";
                    return fromList(database.getPuzzleUrls(database.EMPTY));
                }},
            { title: "In Progress",
                func: function () {
                    self.note = "No puzzles in progress";
                    return fromList(database.getPuzzleUrls(database.INPROGRESS));
                }},
            { title: "Completed",
                func: function () {
                    self.note = "No completed puzzles";
                    return fromList(database.getPuzzleUrls(database.COMPLETED));
                }},
            { title: "Chronicle of Higher Education",
                func: weekly(function (date) {
                    return "http://chronicle.com/items/biz/puzzles/" + eightDigitDate(date) + ".puz";
                }, 5)},
            { title: "Eugene Sheffer",
                func: lastTwoWeeks(function (date) {
                    return "http://puzzles.kingdigital.com/javacontent/clues/sheffer/" +
                            eightDigitDate(date) + ".txt";
                }, [0])},
            { title: "Globe and Mail Canadiana",
                func: weekly(function (date) {
                    return "http://v1.theglobeandmail.com/v5/content/puzzles/crossword_canadian/source/can" +
                            sixDigitDate(date) + "-data.xml";
                }, 1)},
            { title: "Globe and Mail Cryptic",
                func: function () {
                    var week0 = new Date('1968-01-21');
                    var now = new Date();
                    var msperwk = 1000 * 60 * 60 * 24 * 7;
                    var week = Math.floor((now - week0) / msperwk);
                    var n = week * 6 + now.getDay();
                    var retval = [];
                    for (var i=0; i<12; i++, n--)
                        retval.push({ url: "http://www.theglobeandmail.com/static/crosswords/" + n + "crp.xml",
                                      title: "No. " + n });
                    return retval;
                }},
            { title: "The Independent's Concise",
                func: lastTwoWeeks(function (date) {
                    return "http://cdn.games.arkadiumhosted.com/independent/daily-crossword/s_" +
                            sixDigitDate(date) + ".xml";
                })},
            { title: "The Independent's Cryptic",
                func: lastTwoWeeks(function (date) {
                    return "http://cdn.games.arkadiumhosted.com/independent/daily-crossword/c_" +
                            sixDigitDate(date) + ".xml";
                })},
            { title: "Jonesin' Crosswords",
                func: weekly(function (date) {
                    return "http://herbach.dnsalias.com/Jonesin/jz" + sixDigitDate(date) + ".puz";
                }, 2)},
            { title: "King Premier",
                func: weekly(function (date) {
                    return "http://puzzles.kingdigital.com/javacontent/clues/premier/" +
                            eightDigitDate(date) + ".txt";
                }, 0)},
            { title: "LA Times",
                func: lastTwoWeeks(function (date) {
                    return "http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la" +
                            sixDigitDate(date) + ".xml";
                })},
            { title: "Newsday",
                func: lastTwoWeeks(function (date) {
                    return "http://www.brainsonly.com/servlets-newsday-crossword/newsdaycrossword?date=" +
                    sixDigitDate(date) + "&fmt=nwd";  // fmt only to help our format detection
                })},
            { title: "New York Times Classics",
                func: function () {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "http://www.nytimes.com/svc/crosswords/v2/puzzles-for-section-front.json");
                    xhr.responseType = "text";
                    //xhr.withCredentials = true;

                    function error(msg) {
                        self.update({ note: "Could not load puzzle list (" + msg + ")" });
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
                        var retval = [];
                        for (var i=0; i<puzzles.length; i++) {
                            var date = new Date(puzzles[i].print_date);
                            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                            var url = "http://www.nytimes.com/svc/crosswords/v2/puzzle/daily-" +
                                        puzzles[i].print_date + ".json";
                            retval.push({ url: url, title: date.toDateString() });
                        }
                        self.update({ puzzles: retval });
                    }
                    xhr.send();
                    
                    self.note = "Loading list...";
                    return [];
                }},
            { title: "Thomas Joseph",
                func: lastTwoWeeks(function (date) {
                    return "http://puzzles.kingdigital.com/javacontent/clues/joseph/" +
                            eightDigitDate(date) + ".txt";
                }, [0])},
            { title: "Universal",
                func: lastTwoWeeks(function (date) {
                    return "http://picayune.uclick.com/comics/fcx/data/fcx" +
                            sixDigitDate(date) + "-data.xml";
                    })},
            { title: "USA Today",
                func: lastTwoWeeks(function (date) {
                    return "http://picayune.uclick.com/comics/usaon/data/usaon" +
                            sixDigitDate(date) + "-data.xml";
                })},
            { title: "Wall Street Journal",
                func: lastTwoWeeks(function (date) {
                    var prefix = (date.getDay() == 6) ? "wsjxwd" : "gnyxwd";
                    return "http://blogs.wsj.com/applets/" + prefix + eightDigitDate(date) + ".dat";
                }, [0])},
            { title: "The Week",
                func: function () {
                    var week0 = new Date('2009-06-12');
                    var msperwk = 1000 * 60 * 60 * 24 * 7;
                    var week = Math.floor((new Date() - week0) / msperwk);
                    var retval = [];
                    for (var i=0; i<8; i++, week--) {
                        var url = "http://api.theweek.com/sites/default/files/crosswords/Week" + week + ".puz";
                        var pub = new Date(week0.getTime() + week * msperwk);
                        pub.setMinutes(pub.getTimezoneOffset());
                        retval.push({ url: url, title: pub.toDateString() });
                    }
                    return retval;
                }}
        ];
        
        self.puzzles = [];
        self.note = "";
        self.selected = null;
        self.deleteMode = false;
        
        setPuzzles(event) {
            var smallscreen = (self.sources.offsetWidth == document.body.offsetWidth);
            if (event.item.title == self.selected) {
                if (self.deleteMode) {
                    var input = event.target.querySelector("input");
                    if (input.indeterminate) {
                        input.indeterminate = false;
                        input.checked = true;
                    } else {
                        input.checked = !input.checked;
                    }
                    self.datesDelete(input.checked);
                    event.preventUpdate = true;
                    return;
                }
                if (smallscreen) {
                    self.puzzles = [];
                    self.note = "";
                    self.deleteMode = false;
                    window.history.back();
                    return;
                }
                event.preventUpdate = true;
                return;
            }
            if (smallscreen)
                self.sources.scrollTop = 0;
            self.dates.scrollTop = 0;
            self.puzzles = event.item.func();
            self.deleteMode = false;
            riot.route("/" + event.item.title);
        }
        
        setPuzzlesInput(event) {
            event.preventUpdate = true;
            event.stopPropagation();
            self.datesDelete(event.target.checked);
        }
        
        datesDelete(checked) {
            var inputs = self.dates.querySelectorAll("input");
            for (var i=0; i<inputs.length; i++)
                inputs[i].checked = checked;
        }

        clickPuzzle(event) {
            event.preventUpdate = true;
            if (self.deleteMode) {
                var input = event.target.querySelector("input");
                input.checked = !input.checked;
                self.sourcesDeleteIndeterminate();
            } else {
                event.target.classList.add("busy");
                riot.loadPuzzle(event.item.url);
            }
        }
        
        clickPuzzleInput(event) {
            event.preventUpdate = true;
            event.stopPropagation();
            self.sourcesDeleteIndeterminate();
        }
        
        sourcesDeleteIndeterminate() {
            var input = self.sources.querySelector("input");
            var inputs = self.dates.querySelectorAll("input");
            var checked = false;
            var unchecked = false;
            for (var i=0; i<inputs.length; i++)
                if (inputs[i].checked)
                    checked = true;
                else
                    unchecked = true;
            input.indeterminate = checked && unchecked;
            input.checked = checked && !unchecked;
        }
        
        about(event) {
            event.preventUpdate = true;
            riot.route("about");
        }
        
        enableDelete(event) {
            self.deleteMode = true;
        }
        
        disableDelete(event) {
            self.deleteMode = false;
            var inputs = self.root.querySelectorAll("input[type='checkbox']");
            for (var i=0; i<inputs.length; i++) {
                inputs[i].checked = false;
                inputs[i].indeterminate = false;
            }
        }
        
        deletePuzzles(event) {
            var inputs = self.dates.querySelectorAll("input");
            var deleteUrls = [];
            for (var i=0; i<inputs.length; i++)
                if (inputs[i].checked)
                    deleteUrls.push(inputs[i].attributes.url.value);
            database.deletePuzzles(deleteUrls);
            self.disableDelete();
            self.update();
        }
        
        getFile(event) {
            self.fileinput.click();
            
            self.puzzles = [];
            self.note = "";
            self.selected = null;
            self.deleteMode = false;
        }
        
        loadFile(event) {
            if (event.target.files.length == 0)
                return;
            var f = event.target.files[0];
            riot.loadPuzzle(window.URL.createObjectURL(f), f.name);
        }
        
        self.on("update", function () {
            var puzzles;
            // A list of saved puzzles may change between updates, so reload them from the database.
            if (self.selected == "Empty")
                puzzles = fromList(database.getPuzzleUrls(database.EMPTY));
            else if (self.selected == "In Progress")
                puzzles = fromList(database.getPuzzleUrls(database.INPROGRESS));
            else if (self.selected == "Completed")
                puzzles = fromList(database.getPuzzleUrls(database.COMPLETED));
            else
                puzzles = self.puzzles;
            
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
            if (self.selected)
                self.root.classList.add("view-dates");
            else
                self.root.classList.remove("view-dates");
            
            var busy = self.root.querySelectorAll(".busy");
            for (var i=0; i<busy.length; i++)
                busy[i].classList.remove("busy");
        });
    </script>
</list-page>
