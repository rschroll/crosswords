/* Copyright 2014-2015 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */
<about-page>
    <header class="page">
        <button class="back" onclick={ close } title="Back"></button>
        <h1>About</h1>
    </header>

    <div>
        <h2>Welcome to Crosswords!</h2>
        
        <p>When you first start Crosswords, you are presented with a list of sources for puzzles.  Select any of these, and you will see a selection of recent puzzles, ordered newest to oldest.  Selecting any puzzle will cause it to be downloaded and opened for solving.</p>
        
        <p>As you work on the crossword, your progress is saved.  Incomplete puzzles are listed in the <i>In Progress</i> category and are moved to the <i>Completed</i> category once they have been solved.  Puzzles with no cells filled in are listed under <i>Empty</li>.</p>
        
        <h2>Solving</h2>
        
        <p>Enter a letter in the highlighted cell with your keyboard.  On touch devices, your on-screen keyboard should open automatically; if not, touch the grid to trigger it.  After you enter a letter, the highlight will move to the next cell in the answer.  <b>Space</b> will clear the current square and move forwards, and <b>Backspace</b> will clear and move backwards.  Select another cell to move the highlight, or select the highlighted cell again to switch between across and down.  Selecting a clue will move the highlight to the first empty cell in that answer.</p>
        
        <p>You may navigate around the grid using the arrow keys.  Use <b>,</b> to change the direction without moving the highlight.  <b>Tab</b> and <b>Enter</b> move to the answer for the next clue, while <b>Shift</b>+<b>Tab</b> or <b>.</b> moves to the previous clue's answer.  <b>Home</b> moves to the first cell in the current answer, while <b>End</b> moves to the last cell.</p>
        
        <p>Several actions can be triggered by icons on the puzzle page.  On large screens, these icons are in the header.  On small screens, these icons are displayed by activating the <img src="img/navigation-menu.svg" alt="Menu" /> icon in the lower right.  The <img src="img/tick@30.png" alt="Check" /> icon will check your fill and change any incorrect letters to red.  Use the <img src="img/reveal.svg" alt="Reveal" /> icon to show the correct letter for the current cell, or <img src="img/compose.svg" alt="Solve" /> to solve the whole puzzle.  <img src="img/info.svg" alt="Info" /> will display information about the puzzle, and <img src="img/back.svg" alt="Back" /> returns you to the list of puzzles.</p>
        
        <h2>Importing</h2>
        
        <p>Crosswords can import puzzle files in a number of formats, although the only one you are likely to encounter online is the Across Lite <tt>.puz</tt> format.  At the bottom of the list of puzzle sources is the <i>Import File</i> item.  Select this and a file dialog will open, allowing you to choose a file to import.  At the moment, only a single puzzle can be imported at a time.  (Unfortunately, Ubuntu Touch does not support this option as of this writing.)  Puzzles can also be drag-and-dropped into Crosswords.</p>
        
        <p>On Ubuntu Touch, you can also import files via the Content Hub.  Crosswords is registered as an importer of documents.  Any other app that recognizes puzzle files as documents can export them to Crosswords.  (As of this writing, we are unaware of any apps that do so.)  You can also share links to puzzles and have Crosswords import them automatically.  (As of this writing, this can be done from the web browser only with a bit of trickery:  When you encounter a link to a puzzle online, long press it and then select "Open link in new tab".  A new tab will open, and then an "Open with" dialog appears, which gives you no options.  Touch "Cancel" at the bottom to return to the (empty) tab.  Open the menu at the top right, select "Share", and then choose "Crosswords" as the destination.)</p>
        
        <h2>Deleting</h2>
        
        <p>You may delete puzzles in the <i>Empty</i>, <i>In Progress</i>, and <i>Completed</i> categories.  Select the <img src="img/delete.svg" alt="Delete" /> icon to enter delete mode.  Select the puzzles which you wish to delete, or select the category to choose all the puzzles.  Use the <img src="img/delete-red.svg" alt="Delete" /> icon to delete those puzzles, or cancel with <img src="img/cancel.svg" alt="Cancel">.</p>
        
        <h2>Bugs</h2>
        
        <p>While we hope you will only be frustrated with the crossword puzzles, we're sure there are a few bugs in the app itself.  If you find one, please report it to our <a href="https://github.com/rschroll/crosswords/issues">bug tracker</a>.</p>
        
        <h2>Colophon</h2>
        
        <p>This is version 0.3.0 of <a href="http://rschroll.github.io/crosswords/">Crosswords</a> for Ubuntu.</p>
        
        <p>Crosswords is Copyright 2014-2015 by Robert Schroll and incorporates copyrighted material for several other authors under various licenses.</p>
        
        <p>Crosswords is released under the <a href="https://github.com/rschroll/crosswords/blob/master/LICENSE">GPL v3 (or later)</a>.  The source code is <a href="https://github.com/rschroll/crosswords/">available on Github</a>.</p>
    </div>
    
    <script>
        var self = this;
        self.mixin("display");
    </script>
</about-page>
