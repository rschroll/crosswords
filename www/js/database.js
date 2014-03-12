/* Copyright 2014 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */

(function (self) {

    var db;

    function openDatabase() {
        var request = indexedDB.open("crosswords", 1);
        request.onerror = function (e) {
            console.log("Opening database: " + e);
        };
        request.onupgradeneeded = function (e) {
            var objectStore = e.target.result.createObjectStore("puzzles", { keyPath: "url" });
            objectStore.createIndex("completion", "completion", { unique: false });
        };
        request.onsuccess = function (e) {
            db = request.result;
            db.onerror = function (event) {
                console.log("Database error: " + event.target.errorCode);
            };
        };
    }
    openDatabase();

    // Completion worked out from fill, but capped at 0.99.  Must pass 1 for full completion.
    self.putPuzzle = function (url, puzzle, fill, completion) {
        if (completion == null) {
            if (fill == null) {
                completion = 0;
            } else {
                var count = 0;
                for (var i=0; i<puzzle.nrow; i++)
                    for (var j=0; j<puzzle.ncol; j++)
                        if (puzzle.grid[i][j] != " ")
                            count += 1;
                completion = Math.min(count/puzzle.ncells, 0.99)
            }
        }
        var obj = { url: url, puzzle: puzzle, fill: fill, completion: completion };
        db.transaction(["puzzles"], "readwrite").objectStore("puzzles").put(obj);
    }

    self.getPuzzle = function (url, onsucceed, onfail) {
        db.transaction(["puzzles"]).objectStore("puzzles").get(url).onsuccess = function (e) {
            var data = e.target.result;
            if (data != undefined)
                onsucceed(data.url, data.puzzle, data.fill, data.completion);
            else
                onfail(url);
        };
    }

})(window.database = window.database || {})
