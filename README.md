Crosswords
==========

Crosswords is an HTML5 application that lets you enjoy crossword puzzles
from a number of online sources.  It can also load puzzles in the
popular Across Lite .PUZ format.  Crosswords was originally written for
Ubuntu, but it should work on any platform with a modern browser.

Building
--------
Crosswords is built with the [Riot][1] Javascript library.  It requires
the [Riot compiler][2] to compile the tag files into Javascript.  The
included Makefile lets you do this with a simple
```
$ make
```
Other make targets include `tar` to bundle the necessary files for an
end-user into a tarball, and `click` to create a Click package for
Ubuntu Touch.

[1]: https://muut.com/riotjs/
[2]: https://muut.com/riotjs/compiler.html#pre-compilation

Running
-------
Once the tag files have been compiled, you can simply open
`www/index.html` in any modern web browser.  Note that cross-origin
restrictions may prevent some of the puzzles from being loaded.  You may
be able to fix this with your browser's settings.

The script `crosswords` will open this page in a dedicated window, which
is set up to allow access to the remote puzzles.  It requires Python,
GTK, and WebKitGTK.

The included desktop file is meant for use on Ubuntu Touch.

Usage instructions can be found via the "info" icon in the application.
More information on ready-built downloads can be found on the
[website][3].

[3]: http://rschroll.github.io/crosswords/

License
-------
Crosswords is copyright Robert Schroll and others.  As a whole, the
software is licensed under the GNU General Public License (version 3 or
later).  See the LICENSE files for terms.  Some components are used
under more liberal licences; see the individual files for details.
