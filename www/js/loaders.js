/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

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
        down: [],
        ncells: 0
    };
    metadata = doc.querySelectorAll("metadata *");
    for (var i=0; i<metadata.length; i++)
        retval.metadata[metadata[i].nodeName] = metadata[i].textContent;

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
            type: cell.getAttribute("type"),
            shape: cell.getAttribute("background-shape")
        };
        if (cell.getAttribute("type") != "block")
            retval.ncells += 1;
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

function UClickXMLtoJSON(doc) {

    function getValue(tagname) {
        var el = doc.querySelector(tagname);
        return el ? el.getAttribute("v") : null;
    }

    var retval = {
        metadata: {},
        grid: [],
        across: [],
        down: [],
        ncells: 0
    };
    retval.metadata["title"] = getValue("Title");
    var ed = getValue("Editor");
    retval.metadata["creator"] = getValue("Author") + (ed ? " / Ed. " + getValue("Editor") : "");
    retval.metadata["copyright"] = getValue("Copyright");
    retval.metadata["description"] = getValue("Category");

    retval.ncol = parseInt(getValue("Width"));
    retval.nrow = parseInt(getValue("Height"));
    var letters = getValue("AllAnswer");
    for (var i=0; i<retval.nrow; i++) {
        retval.grid[i] = [];
        for (var j=0; j<retval.ncol; j++) {
            var letter = letters[i*retval.nrow + j];
            retval.grid[i][j] = {
                solution: (letter == "-") ? null : letter,
                type: (letter == "-") ? "block" : null
            };
            if (letter != "-")
                retval.ncells += 1;
        }
    }

    var acrossClues = doc.querySelectorAll("across *");
    for (var i=0; i<acrossClues.length; i++) {
        var clue = acrossClues[i];
        var number = parseInt(clue.getAttribute("cn"));
        retval.across[number] = decodeURIComponent(clue.getAttribute("c"));
        var n = parseInt(clue.getAttribute("n")) - 1,
            x = n % retval.nrow,
            y = Math.floor(n / retval.nrow),
            l = clue.getAttribute("a").length;
        retval.grid[y][x].number = number;
        for (var j=0; j<l; j++)
            retval.grid[y][x+j].across = number;
    }

    var downClues = doc.querySelectorAll("down *");
    for (var i=0; i<downClues.length; i++) {
        var clue = downClues[i];
        var number = parseInt(clue.getAttribute("cn"));
        retval.down[number] = decodeURIComponent(clue.getAttribute("c"));
        var n = parseInt(clue.getAttribute("n")) - 1,
            x = n % retval.nrow,
            y = Math.floor(n / retval.nrow),
            l = clue.getAttribute("a").length;
        retval.grid[y][x].number = number;
        for (var j=0; j<l; j++)
            retval.grid[y+j][x].down = number;
    }

    return retval;
}
