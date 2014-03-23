/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

(function (self) {

    var db = localStorage["crosswords"] ? JSON.parse(localStorage["crosswords"]) :
                                          { puzzles: {}, inprogress: [], completed: [] };

    // Completion worked out from fill, but capped at 0.99.  Must pass 1 for full completion.
    self.putPuzzle = function (url, puzzle, fill, completion) {
        if (completion == null) {
            if (fill == null) {
                completion = 0;
            } else {
                var count = 0;
                for (var i=0; i<puzzle.nrow; i++)
                    for (var j=0; j<puzzle.ncol; j++)
                        if (fill[i][j] != " ")
                            count += 1;
                completion = Math.min(count/puzzle.ncells, 0.99);
            }
        }
        var obj = { puzzle: puzzle, fill: fill, completion: completion };
        db.puzzles[url] = obj;

        var i = db.inprogress.indexOf(url);
        if (i > -1)
            db.inprogress.splice(i, 1);
        i = db.completed.indexOf(url);
        if (i > -1)
            db.completed.splice(i, 1);
        if (completion == 1)
            db.completed.splice(0, 0, url);
        else
            db.inprogress.splice(0, 0, url);
        localStorage["crosswords"] = JSON.stringify(db);
    }

    self.getPuzzle = function (url, onsucceed, onfail) {
        var data = db.puzzles[url];
        if (data == undefined)
            onfail(url);
        else
            onsucceed(url, data.puzzle, data.fill, data.completion);
    }

    self.forEach = function (solved, callback, callbackNone) {
        var list = solved ? db.completed : db.inprogress;
        for (var i=0; i<list.length; i++) {
            var data = db.puzzles[list[i]];
            callback(list[i], data.puzzle, data.fill, data.completion);
        }
        if (!list.length)
            callbackNone(solved ? "No completed puzzles" : "No puzzles in progress");
    }

})(window.database = window.database || {})
