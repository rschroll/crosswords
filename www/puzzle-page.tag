/* Copyright 2014-2015 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */
<puzzle-page>
    <header class="page collapsed">
        <button class="back" onclick={ back } title="Back"></button>
        <h1>{ puzzle.metadata.title }</h1>
        <ul class="actions">
            <li onclick={ solve }>
                <img src="img/compose.svg" alt="Solve" title="Solve" />
                <span>Solve</span>
            </li>
            <li onclick={ check }>
                <img src="img/tick@30.png" alt="Check" title="Check" />
                <span>Check</span>
            </li>
            <li onclick={ reveal }>
                <img src="img/reveal.svg" alt="Reveal" title="Reveal" />
                <span>Reveal</span>
            </li>
            <li onclick={ info }>
                <img src="img/info.svg" alt="Info" title="Info" />
                <span>Info</span>
            </li>
            <li class="menu" onclick={ collapse }>
                <img src="img/navigation-menu.svg" alt="Menu" title="Menu" />
                <span>Menu</span>
            </li>
        </ul>
    </header>

    <div id="gridcontainer">
        <table id="grid" class={ solved: completion == 1 }>
            <tr each={ row, i in puzzle.grid }><!--
             --><td each={ cell, j in row } class={ parent.parent.gridClass(cell) } id={ 'r' + i + 'c' + j }><!--
                 --><span class="number" if={ cell.number }>{ cell.number }</span><!--
                 --><span class="letter">{ parent.parent.fill[i][j] }</span><!--
             --></td><!--
         --></tr>
        </table>
        <div id="Vscroll"></div>
        <div id="Hscroll"></div>
    </div>

    <section id="across" class="clues list">
        <header>Across</header>
        <ul>
            <li each={ enumerate(puzzle.across) } id={ 'across' + n } onclick={ parent.clickClue('across', n) }>
                { n + ". " + clue }
            </li>
        </ul>
    </section>

    <section id="down" class="clues list">
        <header>Down</header>
        <ul>
            <li each={ enumerate(puzzle.down) } id={ 'down' + n } onclick={ parent.clickClue('down', n) }>
                { n + ". " + clue }
            </li>
        </ul>
    </section>
    
    <script>
        var self = this;
        self.mixin("display");
        
        self.url = "";
        self.puzzle = null;
        self.fill = [];
        self.selr = 0;
        self.selc = 0;
        self.seldir = "across";
        self.fitzoom = 1;
        self.startzoom = 1;
        self.startoffset = [0, 0];
        self.gridzoom = 1;
        self.gridoffset = [0, 0];
        self.container = { X: 0, Y: 0, width: 0, height: 0 };
        self.gridSize = { width: 0, height: 0 };
        self.solved = false;

        self.transformName = (document.body.style.transform == "") ? "transform" : "webkitTransform";
        self.focuser = document.querySelector("#focuser");

        enumerate(list) {
            retval = []
            for (var k in list)
                if (list[k] !== null)
                    retval.push({"n": k, "clue": list[k]});
            return retval;
        }
        
        gridClass(cell) {
            var classes = [];
            if (cell.type == "block")
                classes.push("block");
            if (cell.across)
                classes.push("across" + cell.across);
            if (cell.down)
                classes.push("down" + cell.down);
            if (cell.shape)
                classes.push(cell.shape);
            return classes.join(" ");
        }
        
        setSeldir(dir) {
            if (!dir)
                dir = (self.seldir == "across") ? "down" : "across";
            self.seldir = dir;
            if (dir == "across") {
                self.across.classList.add("seldir");
                self.down.classList.remove("seldir");
            } else {
                self.across.classList.remove("seldir");
                self.down.classList.add("seldir");
            }
        }
        
        canChangeDir(dir) {
            return (self.puzzle.grid[self.selr][self.selc][dir] !== undefined);
        }
        
        function coordsFromID(id) {
            var coords = id.slice(1).split("c");
            return [parseInt(coords[0]), parseInt(coords[1])];
        }

        clickClue(dir, num) {
            return function (event) {
                event.preventUpdate = true;
                self.setSeldir(dir);
                var cells = document.querySelectorAll("." + dir + num);
                for (var i=0; i<cells.length; i++) {
                    var coords = coordsFromID(cells[i].id);
                    if (self.fill[coords[0]][coords[1]] == " ") {
                        self.selectCell(coords[0], coords[1]);
                        return;
                    }
                }
                var coords = coordsFromID(cells[0].id);
                self.selectCell(coords[0], coords[1]);
            };
        }

        clickCell(y, x) {
            if (self.selr == y && self.selc == x)
                self.setSeldir();
            self.selectCell(y, x);
        }

        function getCellEl(y, x, subel) {
            if (subel == null) subel = "";
            return document.querySelector("#r" + y + "c" + x + subel);
        }

        selectCell(y, x) {
            self.selr = y;
            self.selc = x;
            var across = self.puzzle.grid[y][x].across,
                down = self.puzzle.grid[y][x].down,
                styleClasses = ["selCell", "selCells", "selClue"];
            
            // Cryptic crosswords have cells that are used in only one answer
            if (!across)
                self.setSeldir("down");
            else if (!down)
                self.setSeldir("across");

            for (var i=0; i<styleClasses.length; i++) {
                var els = document.querySelectorAll("." + styleClasses[i]);
                for (var j=0; j<els.length; j++)
                    els[j].classList.remove(styleClasses[i]);
            }

            var cell = getCellEl(y,x);
            cell.classList.add("selCell");
            var cells = document.querySelectorAll("." + self.seldir + ((self.seldir == "across") ? across : down));
            for (var i=0; i<cells.length; i++)
                cells[i].classList.add("selCells");
            var top = cells[0].offsetTop,
                left = cells[0].offsetLeft,
                bottom = cells[cells.length-1].offsetTop + cells[cells.length-1].offsetHeight,
                right = cells[cells.length-1].offsetLeft + cells[cells.length-1].offsetWidth;
            if (left < -self.gridoffset[1] / self.gridzoom || right > (self.container.width - self.gridoffset[1]) / self.gridzoom) {
                if (right - left < self.container.width / self.gridzoom)
                    self.gridoffset[1] = (self.container.width - self.gridzoom * (left + right))/2;
                else
                    self.gridoffset[1] = self.container.width / 2 -
                                         self.gridzoom * (cell.offsetLeft + cell.offsetWidth/2);
            }
            if (top < -self.gridoffset[0] / self.gridzoom || bottom > (self.container.height - self.gridoffset[0]) / self.gridzoom) {
                if (bottom - top < self.container.height / self.gridzoom)
                    self.gridoffset[0] = (self.container.height - self.gridzoom * (top + bottom))/2;
                else
                    self.gridoffset[0] = self.container.height / 2 -
                                         self.gridzoom * (cell.offsetTop + cell.offsetHeight/2);
            }
            self.fixView(true);

            var clues = document.querySelectorAll("#across" + across + ", #down" + down);
            for (var i=0; i<clues.length; i++) {
                var clue = clues[i];
                clue.classList.add("selClue");
                var parent = clue.offsetParent;
                if (clue.offsetTop < parent.scrollTop ||
                        clue.offsetTop + clue.offsetHeight > parent.scrollTop + parent.offsetHeight)
                    parent.scrollTop = clue.offsetTop + clue.offsetHeight/2 - parent.offsetHeight/2;
            }
        }

        checkSolved() {
            var tableClasses = self.grid.classList;
            tableClasses.remove("solved");
            self.solved = false;
            for (var i=0; i<self.puzzle.nrow; i++)
                for (var j=0; j<self.puzzle.ncol; j++)
                    if (self.puzzle.grid[i][j].solution && self.fill[i][j] != self.puzzle.grid[i][j].solution)
                        return;
            tableClasses.add("solved");
            self.solved = true;
        }

        checkAndSave() {
            self.checkSolved();
            database.putPuzzle(self.url, self.puzzle, self.fill, self.solved ? 1 : null);
        }

        insertLetter(v, y, x, skipcheck) {
            if (x == null) x = self.selc;
            if (y == null) y = self.selr;
            if (v == "solve") v = self.puzzle.grid[y][x].solution;
            self.fill[y][x] = v;
            var el = getCellEl(y, x, " .letter");
            el.textContent = v;
            el.classList.remove("error");
            if (!skipcheck)
                self.checkAndSave();
        }

        stepCoords(coords, dir) {
            var y = coords[0] + dir[0],
                x = coords[1] + dir[1];
            if (x >= self.puzzle.ncol) {
                x = 0;
                y += 1;
                if (y >= self.puzzle.nrow)
                    y = 0;
            } else if (x < 0) {
                x = self.puzzle.ncol - 1;
                y -= 1;
                if (y < 0)
                    y = self.puzzle.nrow - 1;
            }

            if (y >= self.puzzle.nrow) {
                y = 0;
                x += 1;
                if (x >= self.puzzle.ncol)
                    x = 0;
            } else if (y < 0) {
                y = self.puzzle.nrow - 1;
                x -= 1;
                if (x < 0)
                    x = self.puzzle.ncol - 1;
            }
            return [y, x];
        }

        moveCursor(dir, wrap) {
            var dx = (self.seldir == "across") ? dir : 0,
                dy = (self.seldir == "down") ? dir : 0,
                coords = self.stepCoords([self.selr, self.selc], [dy, dx]);
            while (self.puzzle.grid[coords[0]][coords[1]].type == "block") {
                coords = self.stepCoords(coords, [dy, dx]);
            }
            if (wrap || (coords[0] == self.selr + dy && coords[1] == self.selc + dx))
                self.selectCell(coords[0], coords[1]);
        }

        moveClue(dir) {
            var clue = document.querySelector("#" + self.seldir + " .selClue"),
                next = (dir > 0) ? clue.nextElementSibling : clue.previousElementSibling,
                event = new Event("click", {
                                      "view": window,
                                      "bubbles": true,
                                      "cancelable": true });
            if (next == null) {
                self.setSeldir();
                var clues = document.querySelectorAll("#" + self.seldir + " ul li");
                next = clues[(dir > 0) ? 0 : clues.length -1 ];
            }
            next.dispatchEvent(event);
        }

        setGeometry() {
            var containerEl = self.gridcontainer;
            // clientWidth <= offsetWidth, which contains borders + scrollbars
            self.container = { X: containerEl.offsetLeft, Y: containerEl.offsetTop,
                               width: containerEl.offsetWidth, height: containerEl.offsetHeight };
            self.gridSize = { width: self.grid.offsetWidth, height: self.grid.offsetHeight };
            while (containerEl = containerEl.offsetParent) {
                self.container.X += containerEl.offsetLeft;
                self.container.Y += containerEl.offsetTop;
            }

            self.fitzoom = Math.min(self.container.width / self.gridSize.width,
                                    self.container.height / self.gridSize.height);
            // Reset our view.  (Is this the right thing to do?)
            self.gridzoom = self.fitzoom;
            self.fixView();
        }

        fixView(animate) {
            if (animate)
                self.gridcontainer.classList.add("animate");
            else
                self.gridcontainer.classList.remove("animate");
            self.Vscroll.classList.remove("show");
            self.Hscroll.classList.remove("show");

            if (self.gridzoom < self.fitzoom)
                self.gridzoom = self.fitzoom;
            if (self.container.width >= self.gridSize.width * self.gridzoom) {
                self.gridoffset[1] = Math.round((self.container.width - self.gridSize.width * self.gridzoom)/2);
            } else {
                if (self.gridoffset[1] > 0)
                    self.gridoffset[1] = 0;
                if (self.gridoffset[1] < self.container.width - self.gridSize.width * self.gridzoom)
                    self.gridoffset[1] = Math.round(self.container.width - self.gridSize.width * self.gridzoom);
            }
            if (self.container.height >= self.gridSize.height * self.gridzoom) {
                self.gridoffset[0] = Math.round((self.container.height - self.gridSize.height * self.gridzoom)/2);
            } else {
                if (self.gridoffset[0] > 0)
                    self.gridoffset[0] = 0;
                if (self.gridoffset[0] < self.container.height - self.gridSize.height * self.gridzoom)
                    self.gridoffset[0] = Math.round(self.container.height - self.gridSize.height * self.gridzoom);
            }
            self.setTransform();
        }

        setTransform() {
            self.grid.style[self.transformName] =
                "matrix(" + self.gridzoom + ", 0, 0, " + self.gridzoom + ", " +
                self.gridoffset[1] + ", " + self.gridoffset[0] + ")";
            var Vstyle = self.Vscroll.style,
                Hstyle = self.Hscroll.style;
            Vstyle["height"] = self.container.height * self.container.height / (self.gridSize.height * self.gridzoom) + "px";
            Hstyle["width"] = self.container.width * self.container.width / (self.gridSize.width * self.gridzoom) + "px";
            Vstyle["top"] = -self.container.height * self.gridoffset[0] / (self.gridSize.height * self.gridzoom) + "px";
            Hstyle["left"] = -self.container.width * self.gridoffset[1] / (self.gridSize.width * self.gridzoom) + "px";
        }

        showScrolls() {
            self.Vscroll.classList.add("show");
            self.Hscroll.classList.add("show");
            document.body.offsetWidth; // Force layout, to allow for class change to take effect.
        }

        setStart() {
            self.startzoom = self.gridzoom;
            self.startoffset = self.gridoffset;
            self.gridcontainer.classList.remove("animate");
            self.showScrolls();
        }

        zoom(ratio, e) {
            var ctr = [e.pageY - self.container.Y, e.pageX - self.container.X];
            self.gridzoom = self.startzoom * ratio;
            self.gridoffset = [ratio * self.startoffset[0] + ctr[0] * (1 - ratio),
                               ratio * self.startoffset[1] + ctr[1] * (1 - ratio)];
        }

        info(event) {
            event.preventUpdate = true;
            riot.route(encodeURI("info/" + (self.puzzle.metadata["title"] || "") +
                                 "~~~" + (self.puzzle.metadata["creator"] || "") +
                                 "~~~" + (self.puzzle.metadata["description"] || "") +
                                 "~~~" + (self.puzzle.metadata["copyright"] || "")));
        }

        reveal(event) {
            event.preventUpdate = true;
            self.insertLetter("solve");
            self.moveCursor(1, false);
        }

        check(event) {
            event.preventUpdate = true;
            self.grid.classList.add("checking");
            for (var i=0; i<self.puzzle.nrow; i++)
                for (var j=0; j<self.puzzle.ncol; j++)
                    if (self.fill[i][j] != self.puzzle.grid[i][j].solution && self.fill[i][j] != " ")
                        getCellEl(i, j, " .letter").classList.add("error");
            self.grid.offsetWidth; // Force layout, to allow for class change to take effect.
            self.grid.classList.remove("checking");
        }

        solve(event) {
            event.preventUpdate = true;
            for (var i=0; i<self.puzzle.nrow; i++)
                for (var j=0; j<self.puzzle.ncol; j++)
                    self.insertLetter("solve", i, j, true);
            self.checkAndSave();
        }

        back(event) {
            self.root.querySelector("header.page").classList.add("collapsed");
            self.close(event);
        }
        
        collapse(event) {
            event.preventUpdate = true;
            var classList = self.root.querySelector("header.page").classList;
            if (classList.contains("collapsed"))
                classList.remove("collapsed");
            else
                classList.add("collapsed");
        }

        loadDoc(surl, doc, sfill, completion) {
            self.url = surl;
            self.puzzle = doc;
            if (sfill == null) {
                self.fill = [];
                for (var i=0; i<self.puzzle.nrow; i++) {
                    self.fill[i] = [];
                    for (var j=0; j<self.puzzle.ncol; j++)
                        self.fill[i][j] = " ";
                }
            } else {
                self.fill = sfill;
            }

            self.selr = 0;
            self.selc = 0;
            self.setSeldir("across");
            while (self.puzzle.grid[self.selr][self.selc].type == "block")
                self.selc += 1;
            
            riot.route("loaded");
        }
        
        self.on("updated", function () {
            if (self.displayed) {
                self.checkAndSave();
                self.selectCell(self.selr, self.selc);
                self.setGeometry();
                self.focuser.focus();
            } else {
                self.focuser.blur();
            }
        });

        loadRemote(url, fn) {
            if (!fn)
                fn = url.split("/").slice(-1)[0];
            var ext = fn.slice(-3);
            var xhr = new XMLHttpRequest();
            var type = (ext == "puz") ? "arraybuffer" : "text";
            xhr.open("GET", url);
            xhr.responseType = type;

            xhr.onreadystatechange = function(e) {
                if (this.readyState == 4 ) {
                    // Loading from file:// has status == 0 even when successful
                    if (this.status == 200 || url.slice(0, 4) == "file") {
                        var parser = new DOMParser();
                        var str = this.response;
                        var json, error;
                        switch (ext) {
                          case "xml":
                            var doc = parser.parseFromString(str.replace("&nbsp;", " "), "text/xml"),
                                rootname = doc.firstChild.nodeName;
                            if (rootname == "crossword-compiler" || rootname == "crossword-compiler-applet")
                                json = JPZtoJSON(doc);
                            else if (rootname == "crossword")
                                json = UClickXMLtoJSON(doc);
                            else
                                error = "Unknown format (" + rootname + ")";
                            break;

                          case "dat":
                            json = WSJtoJSON(str);
                            break;

                          case "txt":
                            json = KingTXTtoJSON(str, url);
                            break;

                          case "son":  // Actually json, but truncated by above
                            json = NYTtoJSON(str);
                            break;

                          case "puz":
                            json = PUZtoJSON(str);
                            if (typeof json == "string")
                                error = json;
                            break;

                          case "nwd":
                            json = NewsdaytoJSON(str);
                            break;

                          default:
                            error = "Unknown format (" + ext + ")";
                        }
                        if (!error)
                            self.loadDoc(url, json);
                        else
                            self.loadError(url, error);
                    } else {
                        self.loadError(url, "Server status " + this.status);
                    }
                    if (url.slice(0, 4) == "blob")
                        window.URL.revokeObjectURL(url);
                }
            }
            xhr.send();
        }

        loadError(url, message) {
            riot.route(encodeURI("error/" + message + "~~~" + url));
        }

        loadURL(url, fn) {
            self.update({ puzzle: { across: [], down: [] } });  // Work around riot issue #925
            var puzzle = database.getPuzzle(url);
            if (puzzle)
                self.loadDoc(url, puzzle.puzzle, puzzle.fill, puzzle.completion);
            else
                self.loadRemote(url, fn);
        };

        document.addEventListener('keydown', function(e) {
            if (!self.displayed)
                return;

            if (e.keyCode == 229) // Returned by soft keyboard
                return;           // Let through and deal with in focuser input listener.
            if (e.keyCode >= 65 && e.keyCode <= 90 || e.keyCode == 32) { // space
                self.insertLetter(String.fromCharCode(e.keyCode));
                self.moveCursor(1, false);
            } else if (e.keyCode == 188) { // comma
                self.setSeldir();
                self.selectCell(self.selr, self.selc);
            } else if (e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 190) { // tab, enter, period
                self.moveClue(e.shiftKey != (e.keyCode == 190) ? -1 : 1);
            } else if (e.keyCode >= 37 && e.keyCode <= 40) { // left, up, right, down
                var dir = (e.keyCode % 2) ? "across" : "down";
                var inc = (e.keyCode < 39) ? -1 : 1;
                if (self.seldir != dir && self.fill[self.selr][self.selc] == " " && self.canChangeDir(dir)) {
                    // Change direction only if cell is empty and able
                    self.setSeldir(dir);
                    self.selectCell(self.selr, self.selc);
                } else {
                    // Otherwise, change direction and step (direction will be reset if unable to be changed)
                    self.setSeldir(dir);
                    self.moveCursor(inc, true);
                }
            } else if (e.keyCode == 35 || e.keyCode == 36) { // end, home
                var clue = document.querySelector("#" + self.seldir + " .selClue"),
                    cells = document.querySelectorAll("." + clue.id),
                    cell = cells[(e.keyCode == 35) ? cells.length - 1 : 0],
                    coords = coordsFromID(cell.id);
                self.selectCell(coords[0], coords[1]);
            } else if (e.keyCode == 8) { // backspace
                if (self.fill[self.selr][self.selc] == " ")
                    self.moveCursor(-1, false);
                self.insertLetter(" ");
            } else {
                console.log(e.keyCode);
            }
            e.preventDefault();
        });

        self.focuser.addEventListener("blur", function (e) {
          if (self.displayed)
            e.target.focus();
        });
        // For some reason, this fires twice for each character input, but not for space...
        var prevchar = "";
        document.querySelector("#focuser").addEventListener("input", function (e){
            var char = e.target.value.toUpperCase();
            if (char && char == prevchar && char != " ") {
                prevchar = "";
            } else {
                prevchar = char;
                if (char == ",") {
                    self.setSeldir();
                    self.selectCell(self.selr, self.selc);
                } else if (char == ".") {
                    self.moveClue(1);
                } else {
                    self.insertLetter(char);
                    self.moveCursor(1, false);
                }
            }
            e.target.value = "";
        });

        window.addEventListener("resize", function () {
            if (self.displayed)
                self.setGeometry();
        });

        self.gridcontainer.addEventListener("wheel", function (e) {
            var deltaY = (e.deltaY != undefined) ? e.deltaY : -e.wheelDeltaY
            self.setStart();
            if (deltaY > 0)
                self.zoom(1/1.1, e);
            if (deltaY < 0)
                self.zoom(1.1, e);
            e.preventDefault();
            self.fixView();
        });

        var hammer = Hammer(self.gridcontainer, { prevent_default: true });

        hammer.on("dragstart", self.setStart);
        hammer.on("drag", function (e) {
            self.gridoffset = [self.startoffset[0] + e.gesture.deltaY, self.startoffset[1] + e.gesture.deltaX];
            self.setTransform();
        });
        hammer.on("dragend", function (e) {
            self.fixView(true);
        });

        hammer.on("tap", function (e) {
            var el = e.target;
            while (!el.id)
                el = el.parentElement;
            var coords = coordsFromID(el.id);
            if (!isNaN(coords[0]) && !isNaN(coords[1]) && !el.classList.contains("block"))
                self.clickCell(coords[0], coords[1]);
        });

        hammer.on("transformstart", self.setStart);
        hammer.on("transform", function (e) {
            self.zoom(e.gesture.scale, e.gesture.center);
            self.setTransform();
        });
        hammer.on("transformend", function (e) {
            self.fixView(true);
        });
    </script>

</puzzle-page>
