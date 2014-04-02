/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

// Namespace system adopted from
// http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
function initPuzzle(UI) {
    (function (self) {

        var url = url;
        var puzzle = null;
        var fill = [];
        var selr = 0;
        var selc = 0;
        var seldir = "across";
        var fitzoom = 1;
        var startzoom = 1;
        var startoffset = [0, 0];
        var gridzoom = 1;
        var gridoffset = [0, 0];
        var container = { X: 0, Y: 0, width: 0, height: 0 };
        var grid = { width: 0, height: 0 };
        var solved = false;

        var transformName = (document.body.style.transform == "") ? "transform" : "webkitTransform";

        function coordsFromID(id) {
            var coords = id.slice(1).split("c");
            return [parseInt(coords[0]), parseInt(coords[1])];
        }

        function clickClue(el, data) {
            seldir = data[0];
            var num = data[1],
                cells = document.querySelectorAll("." + seldir + num);
            for (var i=0; i<cells.length; i++) {
                var coords = coordsFromID(cells[i].id);
                if (fill[coords[0]][coords[1]] == " ") {
                    selectCell(coords[0], coords[1]);
                    return;
                }
            }
            var coords = coordsFromID(cells[0].id);
            selectCell(coords[0], coords[1]);
        }

        function clickCell(y, x) {
            if (selr == y && selc == x)
                seldir = (seldir == "across") ? "down" : "across";
            selectCell(y, x);
        }

        function getCellEl(y, x, subel) {
            if (subel == null) subel = "";
            return document.querySelector("#r" + y + "c" + x + subel);
        }

        function selectCell(y, x) {
            selr = y;
            selc = x;
            var across = puzzle.grid[y][x].across,
                down = puzzle.grid[y][x].down,
                styleClasses = ["selCell", "selCells", "selClue"];

            for (var i=0; i<styleClasses.length; i++) {
                var els = document.querySelectorAll("." + styleClasses[i]);
                for (var j=0; j<els.length; j++)
                    els[j].classList.remove(styleClasses[i]);
            }

            var cell = getCellEl(y,x);
            cell.classList.add("selCell");
            var cells = document.querySelectorAll("." + seldir + ((seldir == "across") ? across : down));
            for (var i=0; i<cells.length; i++)
                cells[i].classList.add("selCells");
            var top = cells[0].offsetTop,
                left = cells[0].offsetLeft,
                bottom = cells[cells.length-1].offsetTop + cells[cells.length-1].offsetHeight,
                right = cells[cells.length-1].offsetLeft + cells[cells.length-1].offsetWidth;
            if (left < -gridoffset[1] / gridzoom || right > (container.width - gridoffset[1]) / gridzoom) {
                if (right - left < container.width / gridzoom)
                    gridoffset[1] = (container.width - gridzoom * (left + right))/2;
                else
                    gridoffset[1] = container.width / 2 -
                                        gridzoom * (cell.offsetLeft + cell.offsetWidth/2);
            }
            if (top < -gridoffset[0] / gridzoom || bottom > (container.height - gridoffset[0]) / gridzoom) {
                if (bottom - top < container.height / gridzoom)
                    gridoffset[0] = (container.height - gridzoom * (top + bottom))/2;
                else
                    gridoffset[0] = container.height / 2 -
                                        gridzoom * (cell.offsetTop + cell.offsetHeight/2);
            }
            fixView(true);

            for (var i=0; i<2; i++) {
                var clue = document.querySelector(["#across" + across, "#down" + down][i]);
                clue.classList.add("selClue");
                var parent = clue.offsetParent;
                if (clue.offsetTop < parent.scrollTop ||
                        clue.offsetTop + clue.offsetHeight > parent.scrollTop + parent.offsetHeight)
                    parent.scrollTop = clue.offsetTop + clue.offsetHeight/2 - parent.offsetHeight/2;
            }
        }

        function checkSolved() {
            var tableClasses = document.querySelector("#grid table").classList;
            tableClasses.remove("solved");
            solved = false;
            for (var i=0; i<puzzle.nrow; i++)
                for (var j=0; j<puzzle.ncol; j++)
                    if (puzzle.grid[i][j].solution && fill[i][j] != puzzle.grid[i][j].solution)
                        return;
            tableClasses.add("solved");
            solved = true;
        }

        function checkAndSave() {
            checkSolved();
            database.putPuzzle(url, puzzle, fill, solved ? 1 : null);
        }

        function insertLetter(v, y, x, skipcheck) {
            if (x == null) x = selc;
            if (y == null) y = selr;
            if (v == "solve") v = puzzle.grid[y][x].solution;
            fill[y][x] = v;
            var el = getCellEl(y, x, " .letter");
            el.textContent = v;
            el.classList.remove("error");
            if (!skipcheck)
                checkAndSave();
        }

        function stepCoords(coords, dir) {
            var y = coords[0] + dir[0],
                x = coords[1] + dir[1];
            if (x >= puzzle.ncol) {
                x = 0;
                y += 1;
                if (y >= puzzle.nrow)
                    y = 0;
            } else if (x < 0) {
                x = puzzle.ncol - 1;
                y -= 1;
                if (y < 0)
                    y = puzzle.nrow - 1;
            }

            if (y >= puzzle.nrow) {
                y = 0;
                x += 1;
                if (x >= puzzle.ncol)
                    x = 0;
            } else if (y < 0) {
                y = puzzle.nrow - 1;
                x -= 1;
                if (x < 0)
                    x = puzzle.ncol - 1;
            }
            return [y, x];
        }

        function moveCursor(dir, wrap) {
            var dx = (seldir == "across") ? dir : 0,
                dy = (seldir == "down") ? dir : 0,
                coords = stepCoords([selr, selc], [dy, dx]);
            while (puzzle.grid[coords[0]][coords[1]].type == "block") {
                coords = stepCoords(coords, [dy, dx]);
            }
            if (wrap || (coords[0] == selr + dy && coords[1] == selc + dx))
                selectCell(coords[0], coords[1]);
        }

        function moveClue(dir) {
            var clue = document.querySelector("#" + seldir + " .selClue"),
                next = (dir > 0) ? clue.nextSibling : clue.previousSibling,
                event = new Event("click", {
                                      "view": window,
                                      "bubbles": true,
                                      "cancelable": true });
            if (next == null) {
                seldir = (seldir == "across") ? "down" : "across";
                var clues = document.querySelectorAll("#" + seldir + " ul li");
                next = clues[(dir > 0) ? 0 : clues.length -1 ];
            }
            next.dispatchEvent(event);
        }

        function setGeometry() {
            var containerEl = document.querySelector("#grid"),
                gridEl = document.querySelector("#grid table");
            // clientWidth <= offsetWidth, which contains borders + scrollbars
            container = { X: containerEl.offsetLeft, Y: containerEl.offsetTop,
                          width: containerEl.offsetWidth, height: containerEl.offsetHeight };
            grid = { width: gridEl.offsetWidth, height: gridEl.offsetHeight };
            while (containerEl = containerEl.offsetParent) {
                container.X += containerEl.offsetLeft;
                container.Y += containerEl.offsetTop;
            }

            fitzoom = Math.min(container.width / grid.width, container.height / grid.height);
            // Reset our view.  (Is this the right thing to do?)
            gridzoom = fitzoom;
            fixView();
        }

        function fixView(animate) {
            if (animate)
                document.querySelector("#grid table").classList.add("animate");
            else
                document.querySelector("#grid table").classList.remove("animate");

            if (gridzoom < fitzoom)
                gridzoom = fitzoom;
            if (container.width >= grid.width * gridzoom) {
                gridoffset[1] = Math.round((container.width - grid.width * gridzoom)/2);
            } else {
                if (gridoffset[1] > 0)
                    gridoffset[1] = 0;
                if (gridoffset[1] < container.width - grid.width * gridzoom)
                    gridoffset[1] = Math.round(container.width - grid.width * gridzoom);
            }
            if (container.height >= grid.height * gridzoom) {
                gridoffset[0] = Math.round((container.height - grid.height * gridzoom)/2);
            } else {
                if (gridoffset[0] > 0)
                    gridoffset[0] = 0;
                if (gridoffset[0] < container.height - grid.height * gridzoom)
                    gridoffset[0] = Math.round(container.height - grid.height * gridzoom);
            }
            setTransform();
        }

        function setTransform() {
            document.querySelector("#grid table").style[transformName] =
                "matrix(" + gridzoom + ", 0, 0, " + gridzoom + ", " +
                gridoffset[1] + ", " + gridoffset[0] + ")";
        }

        function setStart() {
            startzoom = gridzoom;
            startoffset = gridoffset;
            document.querySelector("#grid table").classList.remove("animate");
        }

        function zoom(ratio, e) {
            var ctr = [e.pageY - container.Y, e.pageX - container.X];
            gridzoom = startzoom * ratio;
            gridoffset = [ratio * startoffset[0] + ctr[0] * (1 - ratio),
                          ratio * startoffset[1] + ctr[1] * (1 - ratio)];
        }

        function loadDoc(surl, doc, sfill, completion) {
            url = surl;
            puzzle = doc;
            if (sfill == null) {
                fill = [];
                for (var i=0; i<puzzle.nrow; i++) {
                    fill[i] = [];
                    for (var j=0; j<puzzle.ncol; j++)
                        fill[i][j] = " ";
                }
            } else {
                fill = sfill;
            }

            var table = document.querySelector("#grid table");
            if (completion == 1)
                table.classList.add("solved");
            else
                table.classList.remove("solved");
            while (table.firstChild)
                table.removeChild(table.firstChild)
            for (var i=0; i<puzzle.nrow; i++) {
                var row = document.createElement("tr");
                table.appendChild(row);
                for (var j=0; j<puzzle.ncol; j++) {
                    var cell = document.createElement("td");
                    var grid = puzzle.grid[i][j];
                    if (grid.type == "block")
                        cell.classList.add("block");
                    if (grid.across)
                        cell.classList.add("across" + grid.across);
                    if (grid.down)
                        cell.classList.add("down" + grid.down);
                    if (grid.number)
                        cell.innerHTML = "<span class='number'>" + grid.number + "</span>";
                    if (grid.shape)
                        cell.classList.add(grid.shape);
                    cell.innerHTML += "<span class='letter'>" + fill[i][j] + "</span>";
                    cell.id = "r" + i + "c" + j;
                    row.appendChild(cell);
                }
            }

            var across = UI.list("[id='across']");
            across.removeAllItems();
            for (var i=0; i<puzzle.across.length; i++) {
                if (puzzle.across[i])
                    across.append(i + ". " + puzzle.across[i], "", "across" + i, clickClue, ["across", i]);
            }

            var down = UI.list("[id='down']");
            down.removeAllItems();
            for (var i=0; i<puzzle.down.length; i++) {
                if (puzzle.down[i])
                    down.append(i + ". " + puzzle.down[i], "", "down" + i, clickClue, ["down", i]);
            }

            selr = 0;
            selc = 0;
            seldir = "across";
            while (puzzle.grid[selr][selc].type == "block")
                selc += 1;
            document.querySelector("#puzzle-page").setAttribute("data-title", puzzle.metadata["title"] ||
                                                                "Crossword Puzzle");
            UI.pagestack.push("puzzle-page");
            selectCell(selr, selc);
            setGeometry();
            window.setTimeout(function () { UI.toolbar("puzzle-footer").hide(); }, 5000);
        }

        function loadRemote(url) {
            var fn = url.split("/").slice(-1)[0];
            var ext = fn.slice(-3);
            var xhr = new XMLHttpRequest();
            var type = (ext == "jpz") ? "arraybuffer" : "text";
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
                        var json, error;
                        switch (ext) {
                          case "jpz":
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

                          default:
                            error = "Unknown format (" + ext + ")";
                        }
                        if (!error)
                            loadDoc(url, json);
                        else
                            loadError(url, error);
                    } else {
                        loadError(url, "Server status " + this.status);
                    }
                }
            }
            xhr.send();
        }

        function loadError(url, message) {
            document.querySelector("#error-url").innerHTML = url;
            document.querySelector("#error-message").innerHTML = message;
            UI.dialog("load-error-dialog").show();
        }

        self.loadURL = function (url) {
            database.getPuzzle(url, loadDoc, loadRemote)
        };

        document.addEventListener('keydown', function(e) {
            if (UI.pagestack.currentPage() != "puzzle-page")
                return;

            if (e.keyCode >= 65 && e.keyCode <= 90 || e.keyCode == 32) { // space
                insertLetter(String.fromCharCode(e.keyCode));
                moveCursor(1, false);
            } else if (e.keyCode == 13) { // enter
                seldir = (seldir == "across") ? "down" : "across";
                selectCell(selr, selc);
            } else if (e.keyCode == 9) { // tab
                moveClue(e.shiftKey ? -1 : 1);
            } else if (e.keyCode >= 37 && e.keyCode <= 40) { // left, up, right, down
                var dir = (e.keyCode % 2) ? "across" : "down";
                var inc = (e.keyCode < 39) ? -1 : 1;
                if (seldir != dir && fill[selr][selc] == " ") {
                    // Change direction only if cell is empty
                    seldir = dir;
                    selectCell(selr, selc);
                } else {
                    // Otherwise, change direction and step
                    seldir = dir;
                    moveCursor(inc, true);
                }
            } else if (e.keyCode == 35 || e.keyCode == 36) { // end, home
                var clue = document.querySelector("#" + seldir + " .selClue"),
                    cells = document.querySelectorAll("." + clue.id),
                    cell = cells[(e.keyCode == 35) ? cells.length - 1 : 0],
                    coords = coordsFromID(cell.id);
                selectCell(coords[0], coords[1]);
            } else if (e.keyCode == 8) { // backspace
                if (fill[selr][selc] == " ")
                    moveCursor(-1, false);
                insertLetter(" ");
            } else {
                console.log(e.keyCode);
            }
            e.preventDefault();
        });

        // For some reason, this fires twice for each character input, but not for space...
        var prevchar = "";
        document.querySelector("#focuser").addEventListener("input", function (e){
            var char = e.target.value.toUpperCase();
            if (char && char == prevchar && char != " ") {
                prevchar = "";
            } else {
                insertLetter(char);
                prevchar = char;
                moveCursor(1, false);
            }
            e.target.value = "";
        });

        window.addEventListener("resize", function () {
            if (UI.pagestack.currentPage() != "puzzle-page")
                return;

            setGeometry();
        });

        document.getElementById("grid").addEventListener("wheel", function (e) {
            var deltaY = (e.deltaY != undefined) ? e.deltaY : -e.wheelDeltaY
            setStart();
            if (deltaY > 0)
                zoom(1/1.1, e);
            if (deltaY < 0)
                zoom(1.1, e);
            e.preventDefault();
            fixView();
        });

        var hammer = Hammer(document.getElementById("grid"), { prevent_default: true });

        hammer.on("dragstart", setStart);
        hammer.on("drag", function (e) {
            gridoffset = [startoffset[0] + e.gesture.deltaY, startoffset[1] + e.gesture.deltaX];
            setTransform();
        });
        hammer.on("dragend", function (e) {
            fixView(true);
        });

        hammer.on("tap", function (e) {
            var el = e.target;
            while (!el.id)
                el = el.parentElement;
            var coords = coordsFromID(el.id);
            if (!isNaN(coords[0]) && !isNaN(coords[1]) && !el.classList.contains("block"))
                clickCell(coords[0], coords[1]);
        });

        hammer.on("transformstart", setStart);
        hammer.on("transform", function (e) {
            zoom(e.gesture.scale, e.gesture.center);
            setTransform();
        });
        hammer.on("transformend", function (e) {
            fixView(true);
        });

        function onTransitionEnd(e) {
            if (e.propertyName == "transform" || e.propertyName == "-webkit-transform")
                e.target.classList.remove("animate");
        }
        document.querySelector("#grid table").addEventListener("webkitTransitionEnd", onTransitionEnd);
        document.querySelector("#grid table").addEventListener("transitionend", onTransitionEnd);

        document.getElementById("info").addEventListener("click", function() {
            document.querySelector("#info-dialog h1").innerHTML = puzzle.metadata["title"] || "";
            document.querySelector("#info-creator").innerHTML = puzzle.metadata["creator"] || "";
            document.querySelector("#info-description").innerHTML = puzzle.metadata["description"] || "";
            document.querySelector("#info-copyright").innerHTML = puzzle.metadata["copyright"] || "";
            UI.dialog("info-dialog").show();
        });

        document.getElementById("reveal").addEventListener("click", function() {
            insertLetter("solve");
            moveCursor(1, false);
        });

        document.getElementById("check").addEventListener("click", function() {
            var grid = document.querySelector("#grid table");
            grid.classList.add("checking");
            for (var i=0; i<puzzle.nrow; i++)
                for (var j=0; j<puzzle.ncol; j++)
                    if (fill[i][j] != puzzle.grid[i][j].solution && fill[i][j] != " ")
                        getCellEl(i, j, " .letter").classList.add("error");
            grid.offsetWidth; // Force layout, to allow for class change to take effect.
            grid.classList.remove("checking");
        });

        document.getElementById("solve").addEventListener("click", function() {
            for (var i=0; i<puzzle.nrow; i++)
                for (var j=0; j<puzzle.ncol; j++)
                    insertLetter("solve", i, j, true);
            checkAndSave();
        });

        document.querySelector("#info-dialog button").addEventListener("click", function() {
            UI.dialog("info-dialog").hide();
        });

       document.querySelector("#load-error-dialog button").addEventListener("click", function() {
            UI.dialog("load-error-dialog").hide();
        });

    })(window.puzzle = window.puzzle || {})
}
