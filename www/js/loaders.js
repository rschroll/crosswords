function JPZtoJSON(doc) {

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
