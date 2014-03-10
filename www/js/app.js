/**
 * Wait before the DOM has been loaded before initializing the Ubuntu UI layer
 */
window.onload = function () {
    UI = new UbuntuUI();
    UI.init();
    var puzzle = null;
    var fill = [];
    var selr = 0;
    var selc = 0;
    var seldir = "across";

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
                puzzle = JPZtoJSON(doc);
                fill = emptyFill(puzzle.nrow, puzzle.ncol);
                showPuzzle();
            }
        }
        xhr.send();
    }

    function intAttribute(obj, attr) {
        return parseInt(obj.getAttribute(attr));
    }

    function rangeAttribute(obj, attr) {
        var range = obj.getAttribute(attr).split("-");
        var arr = [];
        for (var i=parseInt(range[0]); i<=parseInt(range[1]); i++)
            arr.push(i);
        return arr;
    }

    function JPZtoJSON(doc) {
        var retval = {
            metadata: {},
            grid: [],
            across: [],
            down: []};
        var metadata = doc.querySelector("metadata");
        for (var i=0; i<metadata.childElementCount; i++)
            retval.metadata[metadata.children[i].nodeName] = metadata.children[i].textContent;

        var grid = doc.querySelector("grid");
        retval.ncol = intAttribute(grid, "width");
        retval.nrow = intAttribute(grid, "height");
        for (var i=0; i<retval.nrow; i++)
            retval.grid[i] = [];

        var cells = doc.querySelectorAll("crossword cell");
        for (var i=0; i<cells.length; i++) {
            var cell = cells[i];
            // JPZ uses 1-indexing
            retval.grid[intAttribute(cell, "y")-1][intAttribute(cell, "x")-1] = {
                solution: cell.getAttribute("solution"),
                number: cell.getAttribute("number"),
                type: cell.getAttribute("type")
            };
        }

        var clues = doc.querySelectorAll("crossword clues");
        var acrossClues = clues[0].querySelectorAll("clue");
        for (var i=0; i<acrossClues.length; i++) {
            var clue = acrossClues[i];
            var number = intAttribute(clue, "number");
            retval.across[number] = clue.textContent;
            var word = doc.querySelector("word[id='" + clue.getAttribute("word") + "']");
            var x = rangeAttribute(word, "x");
            var y = intAttribute(word, "y");
            for (var j=0; j<x.length; j++)
                retval.grid[y-1][x[j]-1].across = number;
        }
        var downClues = clues[1].querySelectorAll("clue");
        for (var i=0; i<downClues.length; i++) {
            var clue = downClues[i];
            var number = intAttribute(clue, "number");
            retval.down[number] = clue.textContent;
            var word = doc.querySelector("word[id='" + clue.getAttribute("word") + "']");
            var x = intAttribute(word, "x");
            var y = rangeAttribute(word, "y");
            for (var j=0; j<y.length; j++)
                retval.grid[y[j]-1][x-1].down = number;
        }

        return retval;
    }

    function emptyFill(nrow, ncol) {
        var retval = [];
        for (var i=0; i<nrow; i++) {
            retval[i] = [];
            for (var j=0; j<ncol; j++)
                retval[i][j] = " ";
        }
        return retval;
    }

    function showPuzzle() {
        var table = document.querySelector("#grid table");
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
        for (var i=0; i<puzzle.across.length; i++) {
            if (puzzle.across[i])
                across.append(i + ". " + puzzle.across[i], "", "across" + i, clickClue, ["across", i]);
        }

        var down = UI.list("[id='down']");
        for (var i=0; i<puzzle.down.length; i++) {
            if (puzzle.down[i])
                down.append(i + ". " + puzzle.down[i], "", "down" + i, clickClue, ["down", i]);
        }

        while (puzzle.grid[selr][selc].type == "block")
            selc += 1;
        selectCell(selr, selc);
    }

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
            if (!fill[coords[0]][coords[1]]) {
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

        document.querySelector("#r" + y + "c" + x).classList.add("selCell");
        var cells = document.querySelectorAll("." + seldir + ((seldir == "across") ? across : down));
        for (var i=0; i<cells.length; i++)
            cells[i].classList.add("selCells");
        for (var i=0; i<2; i++) {
            var clue = document.querySelector(["#across" + across, "#down" + down][i]);
            clue.classList.add("selClue");
            var center = clue.offsetTop + clue.offsetHeight/2;
            var parent = clue.offsetParent;
            if (center < parent.scrollTop || center > parent.scrollTop + parent.offsetHeight)
                parent.scrollTop = center - parent.offsetHeight/2;
        }
    }

    // http://cdn.games.arkadiumhosted.com/washingtonpost/crossynergy/cs140308.jpz
    loadJPZfile("file:///home/rschroll/touch/crosswords/test/cs140308.jpz");

    // Add an event listener that is pending on the initialization
    //  of the platform layer API, if it is being used.
    document.addEventListener("deviceready", function() {
        if (console && console.log)
            console.log('Platform layer API ready');
    }, false);
};

