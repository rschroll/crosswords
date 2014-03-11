// Namespace system adopted from
// http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
function initPuzzle(UI) {
    (function (self) {

        var puzzle = null;
        var fill = [];
        var selr = 0;
        var selc = 0;
        var seldir = "across";
        var fitzoom = 1;

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
            return function () {
                if (selr == y && selc == x)
                    seldir = (seldir == "across") ? "down" : "across";
                selectCell(y, x);
            }
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
                right = cells[cells.length-1].offsetLeft + cells[cells.length-1].offsetWidth,
                parent = cells[0].offsetParent;
            if (left < parent.scrollLeft || right > parent.scrollLeft + parent.offsetWidth) {
                if (right - left < parent.offsetWidth)
                    parent.scrollLeft = (left + right - parent.offsetWidth)/2;
                else
                    parent.scrollLeft = cell.offsetLeft + (cell.offsetWidth - parent.offsetWidth)/2;
            }
            if (top < parent.scrollTop || bottom > parent.scrollTop + parent.offsetHeight) {
                if (bottom - top < parent.offsetHeight)
                    parent.scrollTop = (top + bottom - parent.offsetHeight)/2;
                else
                    parent.scrollTop = cell.offsetTop + (cell.offsetHeight - parent.offsetHeight)/2;
            }

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
            for (var i=0; i<puzzle.nrow; i++)
                for (var j=0; j<puzzle.ncol; j++)
                    if (puzzle.grid[i][j].solution && fill[i][j] != puzzle.grid[i][j].solution)
                        return;
            tableClasses.add("solved");
        }

        function insertLetter(v, y, x, skipcheck) {
            if (x == null) x = selc;
            if (y == null) y = selr;
            if (v == "solve") v = puzzle.grid[y][x].solution;
            fill[y][x] = v;
            var el = getCellEl(y, x, " .letter");
            el.innerText = v;
            el.classList.remove("error");
            if (!skipcheck)
                checkSolved();
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

        function setFitzoom() {
            var container = document.querySelector("#grid");
            var grid = document.querySelector("#grid table");
            // clientWidth <= offsetWidth, which contains borders + scrollbars
            fitzoom = Math.min(container.clientWidth / grid.offsetWidth,
                               container.clientHeight / grid.offsetHeight) * 0.98;
            if (fitzoom > 1 || fitzoom > grid.style.zoom)
                grid.style.zoom = fitzoom;
        }

        function zoom(dir) {
            if (fitzoom > 1)
                return

            var grid = document.querySelector("#grid table");
            var scale = (dir > 0) ? 1.1 : 1/1.1;
            grid.style.zoom = Math.min(Math.max(grid.style.zoom * scale, fitzoom), 1);
        }

        self.load = function (doc) {
            puzzle = doc;
            var table = document.querySelector("#grid table");
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
                    else
                        cell.addEventListener("click", clickCell(i, j))
                    if (grid.across)
                        cell.classList.add("across" + grid.across);
                    if (grid.down)
                        cell.classList.add("down" + grid.down);
                    if (grid.number)
                        cell.innerHTML = "<span class='number'>" + grid.number + "</span>";
                    cell.innerHTML += "<span class='letter'></span>"
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

            fill = [];
            for (var i=0; i<puzzle.nrow; i++) {
                fill[i] = [];
                for (var j=0; j<puzzle.ncol; j++)
                    fill[i][j] = " ";
            }

            while (puzzle.grid[selr][selc].type == "block")
                selc += 1;
            document.querySelector("#puzzle-page").setAttribute("data-title", puzzle.metadata["title"] ||
                                                                "Crossword Puzzle");
            UI.pagestack.push("puzzle-page");
            selectCell(selr, selc);
            setFitzoom();
            window.setTimeout(function () { UI.toolbar("puzzle-footer").hide(); }, 5000);
        }

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
            } else if (e.keyCode == 37 || e.keyCode == 39) { // left, right
                if (seldir != "across") {
                    seldir = "across";
                    selectCell(selr, selc);
                } else {
                    moveCursor((e.keyCode == 37) ? -1 : 1, true);
                }
            } else if (e.keyCode == 38 || e.keyCode == 40) { // up, down
                if (seldir != "down") {
                    seldir = "down";
                    selectCell(selr, selc);
                } else {
                    moveCursor((e.keyCode == 38) ? -1 : 1, true);
                }
            } else if (e.keyCode == 8) { // backspace
                if (fill[selr][selc] == " ")
                    moveCursor(-1, false);
                insertLetter(" ");
            } else if (e.keyCode == 188) { // comma
                zoom(-1);
            } else if (e.keyCode == 190) { // period
                zoom(1);
            } else {
                console.log(e.keyCode);
            }
            e.preventDefault();
        });

        window.addEventListener("resize", function () {
            if (UI.pagestack.currentPage() != "puzzle-page")
                return;

            setFitzoom();
        });

        document.getElementById("grid").addEventListener("wheel", function (e) {
            // Not working right now.
            if (e.ctrlKey) {
                console.log(e);
                if (e.wheelDeltaY < 0)
                    zoom(-1);
                if (e.wheelDeltaY > 0)
                    zoom(1);
                e.preventDefault();
            }
        })

        document.getElementById("info").addEventListener("click", function() {
            document.querySelector("#info-dialog h1").innerHTML = puzzle.metadata["title"];
            document.querySelector("#info-creator").innerHTML = puzzle.metadata["creator"];
            document.querySelector("#info-description").innerHTML = puzzle.metadata["description"];
            document.querySelector("#info-copyright").innerHTML = puzzle.metadata["copyright"];
            UI.dialog("info-dialog").show();
        });

        document.getElementById("reveal").addEventListener("click", function() {
            insertLetter("solve");
            moveCursor(1, false);
        });

        document.getElementById("check").addEventListener("click", function() {
            for (var i=0; i<puzzle.nrow; i++)
                for (var j=0; j<puzzle.ncol; j++)
                    if (fill[i][j] != puzzle.grid[i][j].solution && fill[i][j] != " ")
                        getCellEl(i, j, " .letter").classList.add("error");
        });

        document.getElementById("solve").addEventListener("click", function() {
            for (var i=0; i<puzzle.nrow; i++)
                for (var j=0; j<puzzle.ncol; j++)
                    insertLetter("solve", i, j, true);
            checkSolved();
        });

        document.querySelector("#info-dialog button").addEventListener("click", function() {
            UI.dialog("info-dialog").hide();
        });

    })(window.puzzle = window.puzzle || {})
}
